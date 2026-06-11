import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { CsvExportService } from './exportCSV.service';
import { ExcelExportService } from './exportEXCEL.service';
import { PdfExportService } from './exportPDF.service';

@Injectable()
export class ExportService {

  constructor(
    private readonly pdfExport:
      PdfExportService,

    private readonly excelExport:
      ExcelExportService,

    private readonly csvExport:
      CsvExportService,
  ) {}

  async export(
    format: string,
    headers: any,
    data: any[],
    res: Response,
  ) {

    switch (format) {

      case 'pdf':
        return this.pdfExport
          .generate(
            data,
            headers,
            res,
          );

      case 'xlsx':
        return this.excelExport
          .generate(
            data,
            headers,
            res,
          );

      case 'csv':
        return this.csvExport
          .generate(
            data,
            headers,
            res,
          );

      default:
        throw new Error(
          'Invalid format',
        );
    }
  }
}