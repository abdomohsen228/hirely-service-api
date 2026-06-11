import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { Parser } from 'json2csv';

@Injectable()
export class CsvExportService {
  generate(
    data: any[],
    headers: any,
    res: Response,
  ) {

    const formattedData = data.map(item => ({
      candidateName: item.candidate?.name,
      candidateRole: item.candidate?.role,
      applicationStatus: item.application?.applicationStatus,
      matchScore: item.match?.matchScore,
      cvRank: item.indicators?.cvRank,
      english: item.indicators?.english,
      bodyLanguage: item.indicators?.bodyLanguage,
    }));

    const statsSection = [
      {
        Metric: 'Job Title',
        Value: headers.jobTitle,
      },
      {
        Metric: 'Total Applications',
        Value: headers.totalApplications,
      },
      {
        Metric: 'Applications Today',
        Value: headers.applicationsToday,
      },
      {
        Metric: 'Shortlisted Candidates',
        Value: headers.shortlistedCandidates,
      },
      {
        Metric: 'Average Match Score',
        Value: headers.averageMatchScore,
      },
    ];

    const statsParser = new Parser();
    const statsCsv = statsParser.parse(statsSection);

    const tableParser = new Parser({
      fields: [
        {
          label: 'Candidate Name',
          value: 'candidateName',
        },
        {
          label: 'Role',
          value: 'candidateRole',
        },
        {
          label: 'Application Status',
          value: 'applicationStatus',
        },
        {
          label: 'Match Score',
          value: 'matchScore',
        },
        {
          label: 'CV Rank',
          value: 'cvRank',
        },
        {
          label: 'English',
          value: 'english',
        },
        {
          label: 'Body Language',
          value: 'bodyLanguage',
        },
      ],
    });

    const tableCsv =
      tableParser.parse(formattedData);

    const finalCsv =
      `${statsCsv}\n\n${tableCsv}`;

    res.setHeader(
      'Content-Type',
      'text/csv',
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=applications.csv',
    );

    res.send(finalCsv);
  }
}