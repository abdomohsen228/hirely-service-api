import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelExportService {

  async generate(
    data: any[],
    headers: any,
    res: Response,
  ) {

    const workbook =
      new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet(
        'Applications',
      );

    worksheet.addRow([
      'Job Title',
      headers.jobTitle,
    ]);

    worksheet.addRow([
      'Total Applications',
      headers.totalApplications,
    ]);

    worksheet.addRow([
      'Applications Today',
      headers.applicationsToday,
    ]);

    worksheet.addRow([
      'Shortlisted Candidates',
      headers.shortlistedCandidates,
    ]);

    worksheet.addRow([
      'Average Match Score',
      headers.averageMatchScore,
    ]);

    worksheet.addRow([]);
    worksheet.columns = [
      {
        header: 'Candidate Name',
        key: 'candidateName',
        width: 25,
      },
      {
        header: 'Role',
        key: 'candidateRole',
        width: 25,
      },
      {
        header: 'Application Status',
        key: 'applicationStatus',
        width: 20,
      },
      {
        header: 'Match Score',
        key: 'matchScore',
        width: 15,
      },
      {
        header: 'CV Rank',
        key: 'cvRank',
        width: 15,
      },
      {
        header: 'English',
        key: 'english',
        width: 15,
      },
      {
        header: 'Body Language',
        key: 'bodyLanguage',
        width: 15,
      },
    ];


    data.forEach(item => {
      worksheet.addRow({
        candidateName:
          item.candidate?.name,
        candidateRole:
          item.candidate?.role,
        applicationStatus:
          item.application?.applicationStatus,
        matchScore:
          item.match?.matchScore,
        cvRank:
          item.indicators?.cvRank,
        english:
          item.indicators?.english,
        bodyLanguage:
          item.indicators?.bodyLanguage,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=applications.xlsx',
    );

    await workbook.xlsx.write(res);

    res.end();
  }
}