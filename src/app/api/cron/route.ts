import { fetchNewsAndStoreInFirestore } from '@/lib/news';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await fetchNewsAndStoreInFirestore();
    return NextResponse.json({ success: true, message: 'News fetched and stored successfully.' });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ success: false, message: 'Cron job failed.' }, { status: 500 });
  }
}
