export class SendBulkEmailDto {
  candidateIds: string[];

  subject: string;

  body: string;
}