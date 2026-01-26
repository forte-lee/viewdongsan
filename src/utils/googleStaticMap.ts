export function getGoogleStaticMapUrl({
    lat,
    lng,
    width = 600,
    height = 400,
    zoom = 16,
    apiKey,
  }: {
    lat: number;
    lng: number;
    width?: number;
    height?: number;
    zoom?: number;
    apiKey: string;
  }) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red|${lat},${lng}&key=${apiKey}`;
  }
  