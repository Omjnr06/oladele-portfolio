import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch('https://cgfgtbyzpztzfuqdqnzh.supabase.co/storage/v1/object/public/portfolio-media/best-part-guitar.mov', { 
      method: 'HEAD' 
    });
    
    return NextResponse.json({ 
      status: "Supabase Pinged Successfully", 
      active: response.ok 
    });
  } catch (error) {
    return NextResponse.json({ error: "Ping failed" }, { status: 500 });
  }
}