import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/leads/[id]/invoice/pdf
 * Serve invoice PDF for a lead
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Try to find lead in both tables
    let lead = await db.lead.findUnique({ 
      where: { id },
      select: {
        companyInvoicePdfPath: true,
        companyInvoiceNumber: true,
        companyInvoiceLink: true,
      }
    });
    if (!lead) {
      return NextResponse.json({ ok: false, error: 'Lead not found' }, { status: 404 });
    }

    // Check for PDF path or URL
    const pdfPath = lead.companyInvoicePdfPath;
    const pdfUrl = lead.companyInvoiceLink; // Using companyInvoiceLink as potential URL

    // If no PDF path or URL, return 404
    if (!pdfPath && !pdfUrl) {
      return NextResponse.json({ ok: false, error: 'Invoice PDF not available' }, { status: 404 });
    }

    // If PDF path exists, try to serve from local file system
    if (pdfPath) {
      try {
        // Check if it's an absolute path or relative path
        let filePath: string;
        if (pdfPath.startsWith('/')) {
          // Absolute path
          filePath = pdfPath;
        } else {
          // Relative path - resolve from project root
          filePath = join(process.cwd(), pdfPath);
        }

        // Check if file exists
        if (!existsSync(filePath)) {
          return NextResponse.json({ ok: false, error: 'Invoice PDF file not found' }, { status: 404 });
        }

        // Read the file
        const fileBuffer = await readFile(filePath);

        // Generate filename from invoice number or use default
        const filename = lead.companyInvoiceNumber 
          ? `${lead.companyInvoiceNumber}.pdf`
          : 'invoice.pdf';

        // Return PDF with proper headers
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${filename}"`,
            'Cache-Control': 'private, max-age=3600',
          },
        });
      } catch (fileError: any) {
        console.error('[API/Leads/Invoice/PDF] File read error:', fileError);
        return NextResponse.json({ 
          ok: false, 
          error: 'Failed to read invoice PDF file',
          details: fileError.message 
        }, { status: 500 });
      }
    }

    // If PDF URL exists, handle URL-based serving
    if (pdfUrl) {
      // Check if it's an internal URL (starts with /) or external
      if (pdfUrl.startsWith('/')) {
        // Internal route - redirect to it
        return NextResponse.redirect(new URL(pdfUrl, req.url));
      } else if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
        // External URL - redirect to it (or could proxy it, but redirect is safer)
        return NextResponse.redirect(pdfUrl);
      } else {
        // Invalid URL format
        return NextResponse.json({ ok: false, error: 'Invalid invoice PDF URL format' }, { status: 400 });
      }
    }

    // Fallback (should not reach here)
    return NextResponse.json({ ok: false, error: 'Invoice PDF not available' }, { status: 404 });
  } catch (error: any) {
    console.error('[API/Leads/Invoice/PDF] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to serve invoice PDF', details: error.message },
      { status: 500 }
    );
  }
}




