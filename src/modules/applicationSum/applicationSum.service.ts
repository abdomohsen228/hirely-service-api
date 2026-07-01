import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApplicationStatus } from 'src/database/enums/applicationStatus.enum';
import { CompanyIndustry } from 'src/database/enums/companyIndustry.enum';
import { JobStatus } from 'src/database/enums/jobStatus.enum';
import { Job, JobDocument } from 'src/database/schemas/jobs.schema';
import { Hr, HrDocument } from 'src/database/schemas/hr.schema';
import { UserRole } from 'src/database/enums/userRole.enum';
import {
  JobApplication,
  JobApplicationDocument,
} from 'src/database/schemas/application.schema';
import {
  Candidate,
  CandidateDocument,
} from 'src/database/schemas/candidate.schema';
import {
  UserJobScore,
  UserJobScoreDocument,
} from 'src/database/schemas/user_job_score.schema';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import { UploadService } from 'src/upload/upload.service';
import {
  InterviewQuestion,
  InterviewQuestionDocument,
} from 'src/database/schemas/interview_questions.schema';
type JobFilter = Record<string, unknown>;
import { WorkplaceTypeFilter } from 'src/database/enums/workplaceType.enum';
import { ApplicationSumResponseDto } from './dto/response/ApplicationSumResponse.dto';
import { PictureCVStatus } from 'src/database/enums/pictureCVstatus.enum';
import { VideoAiAnalysis, VideoAiAnalysisDocument } from 'src/database/schemas/video_ai_analysis.schema';
import { CandidateInterviewDocument,CandidateInterview } from 'src/database/schemas/candidate_interview.schema';
import { InterviewResponse,InterviewResponseDocument } from 'src/database/schemas/interview_responses.schema';
import { RecruiterNoteDocument,RecruiterNote } from 'src/database/schemas/recruiter_notes.schema';
import { VideoAnalysisSectionDto } from './dto/response/VideoAnalysisSection.dto';
import { NoteDto } from './dto/response/Note.dto';
import { RecruiterNotesSectionDto } from './dto/response/RecruiterNotesSection.dto';


@Injectable()
export class ApplicationSumService {
  private readonly logger = new Logger(ApplicationSumService.name);

  constructor(
    @InjectModel(JobApplication.name)
    private readonly jobApplicationModel: Model<JobApplicationDocument>,
    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(Hr.name) private readonly hrModel: Model<HrDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserJobScore.name)
    private readonly userJobScoreModel: Model<UserJobScoreDocument>,
    @InjectModel(InterviewQuestion.name)
    private readonly interviewQuestionModel: Model<InterviewQuestionDocument>,
    @InjectModel(VideoAiAnalysis.name)
    private readonly videoAiAnalysisModel: Model<VideoAiAnalysisDocument>,
    @InjectModel(CandidateInterview.name)
    private readonly candidateInterviewModel: Model<CandidateInterviewDocument>,
    @InjectModel(InterviewResponse.name)
    private readonly interviewResponseModel: Model<InterviewResponseDocument>,
    @InjectModel(RecruiterNote.name)
    private readonly recruiterNoteModel: Model<RecruiterNoteDocument>,
    private readonly uploadService: UploadService,
  ) {}

  private assertHrUser(user: UserDocument): void {
    if (user.role !== UserRole.HR) {
      throw new ForbiddenException('Only HR users can manage job posts');
    }
  }

  private async getUser(applicationId: string){
    const application = await this.jobApplicationModel.findOne(new Types.ObjectId(applicationId));
    const candidateId = application.candidateId;
    return await this.userModel.findOne(candidateId);
  }

  private async getCVURL(key: string){
    return await this.uploadService.getCvUrl(key)
  }

  private async getPFPURL(key: string){
    return await this.uploadService.getProfilePictureUrl(key)
  }

  public async getApplicationSum(hr: UserDocument, applicationId:string): Promise<ApplicationSumResponseDto> {
    this.assertHrUser(hr);
    const user = await this.getUser(applicationId);
    const application = await this.jobApplicationModel.findOne(new Types.ObjectId(applicationId));

    //CV section
    const CVUrl = await this.getCVURL(user.cvUrl);

    //Profile section
    const candidate = await this.candidateModel.findOne(user._id);
    let pfpURL;
    if(user.profilePictureStatus == PictureCVStatus.APPROVED)
        pfpURL = await this.getPFPURL(user.profilePictureUrl);
    else
        pfpURL = null;

    //video section
    // video analysis video url , appID -> candidateInterview -> interviewResponse -> questionID, order, videoUrl
    const videosResponses = await this.videoAiAnalysisModel.find({applicationId:new Types.ObjectId(applicationId)});
    const candidateInterview = await this.candidateInterviewModel.findOne({applicationId:new Types.ObjectId(applicationId)});
    const interviewData : VideoAnalysisSectionDto[] = [];
    let overallScore = 0;
    for (const response of videosResponses) {
        const interviewResponse = await this.interviewResponseModel.findOne({
            candidateInterviewId: candidateInterview._id,
            response: response.videoUrl,
        });

        const question = await this.interviewQuestionModel.findById(
            interviewResponse.questionId,
        );

        const videoURL = await this.uploadService.getVideoUrlByKey(response.videoUrl);
        overallScore += response.overallInterviewScore;
        interviewData.push({
            order: interviewResponse.responseOrder,
            question: question?.question,
            videoURL: videoURL,
            transcription: response.transcribe,
            bodyLanguage: response.bodyLanguage.scores.overall_body_score,
            confidence: response.bodyLanguage.scores.confidence_score,
            englishLevel: response.audio.english_level,
            communication: response.audio.audio_score,
        });
    }

    
    //Arch alignment section
    const jobScore = await this.userJobScoreModel.findOne({jobId:application.jobId,candidateId:candidate._id});
    const aggScore = ((overallScore+jobScore.score)/((interviewData.length+1)*100))*100 //sum interview scores + cv score all over number of videos + cv *100 into percent
    // feedback

    // recruiter Notes
    const notes = await this.recruiterNoteModel.find({applicationId:new Types.ObjectId(applicationId)});
    const recruiterNotes : NoteDto[] = [];
    for (const note of notes){
        recruiterNotes.push({content:note.content, id:note._id})
    }

    return{
        ProfileSection:{
            pfpURL:pfpURL,
            name:candidate.fullName,
            YearsOfexperience:candidate.yearsOfExperience,
            location:candidate.country,
            status:application.status,
            email:user.email
        },
        ArchitecturalAlignmentSection:{
            score:aggScore,
            summary:'',
            matchingSkills:jobScore.matchedSkills
        },
        CVSection:{
            CVUrl:CVUrl
        },
        VideoAnalysisSection:interviewData,
        RecruiterNotesSection:{
            notes:recruiterNotes? recruiterNotes : null
        }
    }
  }
  public async addNotes(hr: UserDocument, applicationId:string, notes:RecruiterNotesSectionDto): Promise<RecruiterNotesSectionDto> {
    this.assertHrUser(hr);
    const recruiterNotes = notes.notes;
    for(const note of recruiterNotes){
        await this.recruiterNoteModel.create(
        {
            content:note.content,
            applicationId:new Types.ObjectId(applicationId),
            hr:hr._id
        });
    }
    
    const finalNotesModel = await this.recruiterNoteModel.find({applicationId:new Types.ObjectId(applicationId)});
    const res : NoteDto[]=[];
    for(const finalNote of finalNotesModel){
        res.push({
            content:finalNote.content,
            id:finalNote._id
        })
    }
    return {notes:res};
    
  }

  public async deleteNote(hr:UserDocument, applicationId:string, noteId:string){
    this.assertHrUser(hr);
    const application = await this.jobApplicationModel.findById(new Types.ObjectId(applicationId))
    if(!application)
        throw new BadRequestException('Application Not Found!')
    const note = await this.recruiterNoteModel.findById(new Types.ObjectId(noteId));
    if(!note)
        throw new BadRequestException('Note Not Found!')
    await this.recruiterNoteModel.deleteOne({_id:new Types.ObjectId(noteId)})
    return;
  }

  public async updateNote(hr:UserDocument, applicationId:string, noteId:string, noteBody:string){
    this.assertHrUser(hr);
    const application = await this.jobApplicationModel.findById(new Types.ObjectId(applicationId))
    if(!application)
        throw new BadRequestException('Application Not Found!')
    const note = await this.recruiterNoteModel.findById(new Types.ObjectId(noteId));
    if(!note)
        throw new BadRequestException('Note Not Found!')
    await this.recruiterNoteModel.updateOne({_id:new Types.ObjectId(noteId)},{content:noteBody})
    return await this.getNotes(applicationId);
  }

  public async updateStatus(hr:UserDocument, applicationId:string, applicationStatus:ApplicationStatus){
    this.assertHrUser(hr);
    const application = await this.jobApplicationModel.findById(new Types.ObjectId(applicationId))
    if(!application)
        throw new BadRequestException('Application Not Found!')
    await this.jobApplicationModel.updateOne({_id:new Types.ObjectId(applicationId)},{status:applicationStatus})
    return {applicationStatus: applicationStatus};
  }

  private async getNotes(applicationId:string){
    return await this.recruiterNoteModel.find({applicationId:new Types.ObjectId(applicationId)});
  }

  
}


  