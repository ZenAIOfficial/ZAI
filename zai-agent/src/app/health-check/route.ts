export const dynamic = 'force-dynamic' // defaults to auto

export async function GET() {
  return Response.json({ time: new Date().getTime(), version: `${process.env.APP_VERSION}(${process.env.APP_BUILD_TIME})` })
}