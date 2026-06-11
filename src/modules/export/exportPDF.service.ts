import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class PdfExportService {

  generate(
    data: any[],
    headers: any,
    res: Response,
  ) {

    const doc =
      new PDFDocument({
        margin: 30,
      });

    res.setHeader(
      'Content-Type',
      'application/pdf',
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=applications.pdf',
    );

    doc.pipe(res);

    doc
      .fontSize(20)
      .text(
        'Applications Dashboard',
        {
          align: 'center',
        },
      );

    doc.moveDown();
    doc.fontSize(12);

    doc.text(
      `Job Title: ${headers.jobTitle}`,
    );

    doc.text(
      `Total Applications: ${headers.totalApplications}`,
    );

    doc.text(
      `Applications Today: ${headers.applicationsToday}`,
    );

    doc.text(
      `Shortlisted Candidates: ${headers.shortlistedCandidates}`,
    );

    doc.text(
      `Average Match Score: ${headers.averageMatchScore}`,
    );

    doc.moveDown(2);

    doc.fontSize(12).text(
      'Candidate | Role | Status | Match | CV | English | Body',
    );

    doc.moveDown(0.5);

    data.forEach(item => {
      const row =
        `${item.candidate?.name ?? '-'} | ` +
        `${item.candidate?.role ?? '-'} | ` +
        `${item.application?.applicationStatus ?? '-'} | ` +
        `${item.match?.matchScore ?? '-'} | ` +
        `${item.indicators?.cvRank ?? '-'} | ` +
        `${item.indicators?.english ?? '-'} | ` +
        `${item.indicators?.bodyLanguage ?? '-'}`;

      doc.text(row);
    });

    doc.end();
  }
}