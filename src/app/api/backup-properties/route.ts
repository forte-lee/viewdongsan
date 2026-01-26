import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * property와 property_delete 테이블의 모든 데이터를 property_backup에 복사하는 API
 * 1회성 백업 실행용
 */
export async function POST() {
    try {
        // 서버 사이드 Supabase 클라이언트 생성
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        console.log("🔄 property_backup 백업 시작...");

        // 1️⃣ property 테이블의 모든 데이터 가져오기
        console.log("📥 property 테이블 데이터 가져오는 중...");
        const { data: properties, error: propertyError } = await supabase
            .from("property")
            .select("*");

        if (propertyError) {
            throw new Error(`property 데이터 가져오기 실패: ${propertyError.message}`);
        }

        let propertyCount = 0;
        let propertyDeleteCount = 0;

        if (!properties || properties.length === 0) {
            console.log("⚠️ property 테이블에 데이터가 없습니다.");
        } else {
            console.log(`✅ property 테이블에서 ${properties.length}개 레코드 가져옴`);

            // property_backup에 삽입 (upsert 사용하여 중복 방지)
            const propertyBackupData = properties.map((prop: { id: number; create_at: string; update_at: string; property_type: string; data: unknown; on_board_state: unknown; employee_id: number | null; is_register: boolean }) => ({
                id: prop.id,
                create_at: prop.create_at,
                update_at: prop.update_at,
                property_type: prop.property_type,
                data: prop.data,
                on_board_state: prop.on_board_state || null,
                employee_id: prop.employee_id || null,
                is_register: prop.is_register || false,
            }));

            // 배치로 나누어서 삽입 (Supabase는 한 번에 너무 많은 데이터를 삽입할 수 없을 수 있음)
            const batchSize = 100;
            for (let i = 0; i < propertyBackupData.length; i += batchSize) {
                const batch = propertyBackupData.slice(i, i + batchSize);
                const { error: insertError } = await supabase
                    .from("property_backup")
                    .upsert(batch, {
                        onConflict: "id",
                    });

                if (insertError) {
                    throw new Error(`property_backup 삽입 실패 (배치 ${Math.floor(i / batchSize) + 1}): ${insertError.message}`);
                }
                console.log(`✅ property_backup에 ${i + batch.length}/${propertyBackupData.length}개 레코드 삽입 완료`);
            }

            propertyCount = properties.length;
        }

        // 2️⃣ property_delete 테이블의 모든 데이터 가져오기
        console.log("📥 property_delete 테이블 데이터 가져오는 중...");
        const { data: propertyDeletes, error: propertyDeleteError } = await supabase
            .from("property_delete")
            .select("*");

        if (propertyDeleteError) {
            throw new Error(`property_delete 데이터 가져오기 실패: ${propertyDeleteError.message}`);
        }

        if (!propertyDeletes || propertyDeletes.length === 0) {
            console.log("⚠️ property_delete 테이블에 데이터가 없습니다.");
        } else {
            console.log(`✅ property_delete 테이블에서 ${propertyDeletes.length}개 레코드 가져옴`);

            // property_backup에 삽입 (upsert 사용하여 중복 방지)
            const propertyDeleteBackupData = propertyDeletes.map((prop: { id: number; create_at: string; update_at: string; property_type: string; data: unknown; on_board_state: unknown; employee_id: number | null; is_register: boolean }) => ({
                id: prop.id,
                create_at: prop.create_at,
                update_at: prop.update_at,
                property_type: prop.property_type,
                data: prop.data,
                on_board_state: prop.on_board_state || null,
                employee_id: prop.employee_id || null,
                is_register: prop.is_register || false,
            }));

            // 배치로 나누어서 삽입
            const batchSize = 100;
            for (let i = 0; i < propertyDeleteBackupData.length; i += batchSize) {
                const batch = propertyDeleteBackupData.slice(i, i + batchSize);
                const { error: insertError } = await supabase
                    .from("property_backup")
                    .upsert(batch, {
                        onConflict: "id",
                    });

                if (insertError) {
                    throw new Error(`property_backup 삽입 실패 (배치 ${Math.floor(i / batchSize) + 1}): ${insertError.message}`);
                }
                console.log(`✅ property_backup에 ${i + batch.length}/${propertyDeleteBackupData.length}개 레코드 삽입 완료`);
            }

            propertyDeleteCount = propertyDeletes.length;
        }

        console.log("✅ 백업 완료!");
        console.log(`📊 총 처리된 레코드: property ${propertyCount}개, property_delete ${propertyDeleteCount}개`);

        return NextResponse.json({
            success: true,
            propertyCount,
            propertyDeleteCount,
            message: `백업 완료: property ${propertyCount}개, property_delete ${propertyDeleteCount}개`,
        });
    } catch (error: unknown) {
        console.error("❌ 백업 실패:", error);
        return NextResponse.json(
            {
                success: false,
                propertyCount: 0,
                propertyDeleteCount: 0,
                error: error instanceof Error ? error.message : "알 수 없는 오류",
            },
            { status: 500 }
        );
    }
}

