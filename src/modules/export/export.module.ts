import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { PdfExportService } from './exportPDF.service';
import { ExcelExportService } from './exportEXCEL.service';
import { CsvExportService } from './exportCSV.service';
@Module({
  providers: [
    ExportService,
    PdfExportService,
    ExcelExportService,
    CsvExportService,
  ],

  exports: [
    ExportService,
  ],
})
export class ExportModule {}