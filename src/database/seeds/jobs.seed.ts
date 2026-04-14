import 'dotenv/config';
import mongoose, { Types } from 'mongoose';
import { JobSchema } from '../schemas/jobs.schema';
import { UserSchema } from '../schemas/user.schema';
import { JobType } from '../enums/jobType.enum';
import { ExperienceLevel } from '../enums/experienceYears.enum';
import { JobStatus } from '../enums/jobStatus.enum';

type SeedJob = {
  title: string;
  department: string;
  jobType: JobType;
  location: string;
  experienceLevel: ExperienceLevel;
  compensationMin: number;
  compensationMax: number;
  roleContext: string;
  coreResponsibilities: string;
  skills: string[];
  keywords: string[];
  companyName: string;
  status: JobStatus;
  applicationCount: number;
};

const seedJobs: SeedJob[] = [
  {
    title: 'Backend Engineer',
    department: 'Engineering',
    jobType: JobType.FULL_TIME,
    location: 'Remote',
    experienceLevel: ExperienceLevel.MID_LEVEL,
    compensationMin: 35000,
    compensationMax: 50000,
    roleContext:
      'You will build and maintain scalable APIs for the Hirely platform.',
    coreResponsibilities:
      'Design REST endpoints, optimize database queries, and collaborate with product and frontend teams.',
    skills: ['Node.js', 'NestJS', 'MongoDB', 'TypeScript'],
    keywords: ['backend', 'api', 'nestjs', 'mongodb'],
    companyName: 'Hirely',
    status: JobStatus.OPEN,
    applicationCount: 0,
  },
  {
    title: 'Frontend Engineer',
    department: 'Engineering',
    jobType: JobType.FULL_TIME,
    location: 'Cairo, Egypt',
    experienceLevel: ExperienceLevel.JUNIOR,
    compensationMin: 22000,
    compensationMax: 32000,
    roleContext:
      'You will create user-facing features across employer and candidate apps.',
    coreResponsibilities:
      'Build responsive interfaces, integrate APIs, and improve UX quality with reusable components.',
    skills: ['React', 'TypeScript', 'HTML', 'CSS'],
    keywords: ['frontend', 'react', 'ui', 'typescript'],
    companyName: 'Hirely',
    status: JobStatus.OPEN,
    applicationCount: 0,
  },
  {
    title: 'Talent Acquisition Intern',
    department: 'HR',
    jobType: JobType.INTERNSHIP,
    location: 'Hybrid',
    experienceLevel: ExperienceLevel.FRESH,
    compensationMin: 6000,
    compensationMax: 9000,
    roleContext:
      'You will support daily recruitment operations and candidate communication.',
    coreResponsibilities:
      'Post jobs, screen incoming applications, and coordinate interview scheduling.',
    skills: ['Communication', 'Recruitment', 'Google Workspace'],
    keywords: ['internship', 'hr', 'talent', 'recruitment'],
    companyName: 'Hirely',
    status: JobStatus.DRAFT,
    applicationCount: 0,
  },
];

async function resolveCreatedBy(): Promise<Types.ObjectId> {
  const createdByFromEnv = process.env.SEED_JOBS_CREATED_BY;
  if (createdByFromEnv) {
    if (!Types.ObjectId.isValid(createdByFromEnv)) {
      throw new Error('SEED_JOBS_CREATED_BY is not a valid ObjectId.');
    }
    return new Types.ObjectId(createdByFromEnv);
  }

  const UserModel = mongoose.model('User', UserSchema);
  const existingUser = await UserModel.findOne().select('_id').lean();
  if (existingUser?._id) {
    return new Types.ObjectId(existingUser._id);
  }

  const seedUserEmail = 'seed.user@hirely.local';
  const createdSeedUser = await UserModel.create({
    email: seedUserEmail,
    dateOfBirth: new Date('1995-01-01'),
  });

  console.log(`No users found. Created dummy user: ${seedUserEmail}`);
  return new Types.ObjectId(createdSeedUser._id);
}

async function seed(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables.');
  }

  await mongoose.connect(databaseUrl);

  try {
    const createdBy = await resolveCreatedBy();
    const JobModel = mongoose.model('Job', JobSchema);

    await JobModel.deleteMany({ companyName: 'Hirely' });
    await JobModel.insertMany(
      seedJobs.map((job) => ({
        ...job,
        createdBy,
      })),
    );

    console.log(`Seeded ${seedJobs.length} jobs successfully.`);
  } finally {
    await mongoose.disconnect();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error('Failed to seed jobs:', error);
    process.exit(1);
  });
