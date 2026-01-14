import { NextRequest, NextResponse } from 'next/server';
import { analyzePageSpeed, analyzeAllPagesSpeed } from '@/lib/pageSpeedAnalyzer';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page');
  const strategy = (searchParams.get('strategy') || 'mobile') as 'mobile' | 'desktop';
  const all = searchParams.get('all') === 'true';

  try {
    if (all) {
      const results = await analyzeAllPagesSpeed(strategy);
      return NextResponse.json({ data: results });
    } else if (page) {
      const result = await analyzePageSpeed(page, strategy);
      if (!result) {
        return NextResponse.json({ error: 'Failed to analyze page speed' }, { status: 500 });
      }
      return NextResponse.json({ data: result });
    } else {
      return NextResponse.json({ error: 'Missing page parameter' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error analyzing page speed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze page speed' },
      { status: 500 }
    );
  }
}
