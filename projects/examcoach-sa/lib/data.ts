import { and, asc, count, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  attempts,
  entitlements,
  feedback,
  lessons,
  modules,
  paymentEvents,
  profiles,
  progress,
  purchases,
  questions,
  studyTasks,
} from "@/db/schema";
import { lessonSeeds, moduleSeed, questionSeeds } from "./examcoach-content";

export async function ensureSeedData() {
  const db = getDb();
  let [moduleRow] = await db.select().from(modules).where(eq(modules.slug, moduleSeed.slug)).limit(1);
  if (!moduleRow) {
    [moduleRow] = await db.insert(modules).values(moduleSeed).onConflictDoNothing().returning();
    if (!moduleRow) {
      [moduleRow] = await db.select().from(modules).where(eq(modules.slug, moduleSeed.slug)).limit(1);
    }
  }

  const existingLessons = await db.select({ value: count() }).from(lessons).where(eq(lessons.moduleId, moduleRow.id));
  if ((existingLessons[0]?.value ?? 0) === 0) {
    for (const lesson of lessonSeeds) {
      await db.insert(lessons).values({
        moduleId: moduleRow.id,
        slug: lesson.slug,
        title: lesson.title,
        topic: lesson.topic,
        summary: lesson.summary,
        minutes: lesson.minutes,
        position: lesson.position,
        isPreview: lesson.isPreview,
        contentJson: JSON.stringify(lesson.content),
      }).onConflictDoNothing();
    }
  }

  const existingQuestions = await db.select({ value: count() }).from(questions).where(eq(questions.moduleId, moduleRow.id));
  if ((existingQuestions[0]?.value ?? 0) === 0) {
    for (const question of questionSeeds) {
      await db.insert(questions).values({
        moduleId: moduleRow.id,
        topic: question.topic,
        prompt: question.prompt,
        optionsJson: JSON.stringify(question.options),
        correctIndex: question.correctIndex,
        explanation: question.explanation,
        difficulty: question.difficulty,
        marks: question.marks,
        assessmentType: "mock",
      });
    }
  }
  return moduleRow;
}

export async function ensureProfile(email: string, displayName: string) {
  const db = getDb();
  await db.insert(profiles).values({ email, displayName }).onConflictDoUpdate({
    target: profiles.email,
    set: { displayName, lastSeenAt: new Date().toISOString() },
  });
}

export async function ensureStudyTasks(email: string, moduleId: number) {
  const db = getDb();
  const rows = await db.select({ value: count() }).from(studyTasks).where(eq(studyTasks.userEmail, email));
  if ((rows[0]?.value ?? 0) > 0) return;
  const today = new Date().toISOString().slice(0, 10);
  await db.insert(studyTasks).values([
    { userEmail: email, moduleId, title: "Time complexity foundations", topic: "Algorithm analysis", minutes: 11, dueDate: today },
    { userEmail: email, moduleId, title: "3 recurrence practice questions", topic: "Recurrence relations", minutes: 18, dueDate: today },
    { userEmail: email, moduleId, title: "Review stack operations", topic: "Stacks", minutes: 7, dueDate: today },
  ]);
}

export async function getDashboardData(email: string) {
  const db = getDb();
  const moduleRow = await ensureSeedData();
  await ensureStudyTasks(email, moduleRow.id);
  const [lessonRows, progressRows, attemptRows, entitlementRows, taskRows] = await Promise.all([
    db.select().from(lessons).where(eq(lessons.moduleId, moduleRow.id)).orderBy(asc(lessons.position)),
    db.select().from(progress).where(eq(progress.userEmail, email)),
    db.select().from(attempts).where(eq(attempts.userEmail, email)).orderBy(desc(attempts.completedAt)).limit(5),
    db.select().from(entitlements).where(and(eq(entitlements.userEmail, email), eq(entitlements.moduleId, moduleRow.id), eq(entitlements.status, "active"))).limit(1),
    db.select().from(studyTasks).where(eq(studyTasks.userEmail, email)).orderBy(asc(studyTasks.id)).limit(8),
  ]);
  return { module: moduleRow, lessons: lessonRows, progress: progressRows, attempts: attemptRows, entitled: entitlementRows.length > 0, tasks: taskRows };
}

export async function getLesson(email: string, slug: string) {
  const db = getDb();
  const moduleRow = await ensureSeedData();
  const [lesson] = await db.select().from(lessons).where(and(eq(lessons.moduleId, moduleRow.id), eq(lessons.slug, slug))).limit(1);
  if (!lesson) return null;
  const entitlementRows = await db.select().from(entitlements).where(and(eq(entitlements.userEmail, email), eq(entitlements.moduleId, moduleRow.id), eq(entitlements.status, "active"))).limit(1);
  const [progressRow] = await db.select().from(progress).where(and(eq(progress.userEmail, email), eq(progress.lessonId, lesson.id))).limit(1);
  return { lesson, module: moduleRow, entitled: entitlementRows.length > 0, progress: progressRow ?? null };
}

export async function saveAttempt(input: {
  email: string;
  assessmentType: string;
  score: number;
  total: number;
  readiness: number;
  answers: number[];
}) {
  const db = getDb();
  const moduleRow = await ensureSeedData();
  const [attempt] = await db.insert(attempts).values({
    userEmail: input.email,
    moduleId: moduleRow.id,
    assessmentType: input.assessmentType,
    score: input.score,
    total: input.total,
    readiness: input.readiness,
    answersJson: JSON.stringify(input.answers),
  }).returning();
  return attempt;
}

export async function saveLessonProgress(email: string, lessonId: number, mastery: number) {
  const db = getDb();
  const [row] = await db.insert(progress).values({
    userEmail: email,
    lessonId,
    completed: true,
    mastery,
    updatedAt: new Date().toISOString(),
  }).onConflictDoUpdate({
    target: [progress.userEmail, progress.lessonId],
    set: { completed: true, mastery, updatedAt: new Date().toISOString() },
  }).returning();
  return row;
}

export async function setTaskStatus(email: string, taskId: number, status: "todo" | "done") {
  const db = getDb();
  const [row] = await db.update(studyTasks).set({ status }).where(and(eq(studyTasks.id, taskId), eq(studyTasks.userEmail, email))).returning();
  return row;
}

export async function getMockQuestions() {
  const db = getDb();
  const moduleRow = await ensureSeedData();
  return db.select().from(questions).where(and(eq(questions.moduleId, moduleRow.id), eq(questions.assessmentType, "mock"), eq(questions.status, "published"))).orderBy(asc(questions.id));
}

export async function getAdminData() {
  const db = getDb();
  const moduleRow = await ensureSeedData();
  const [studentCount, paidCount, revenue, attemptCount, lessonRows, questionCount, recentPurchases, feedbackRows] = await Promise.all([
    db.select({ value: count() }).from(profiles),
    db.select({ value: count() }).from(purchases).where(eq(purchases.status, "paid")),
    db.select().from(purchases).where(eq(purchases.status, "paid")),
    db.select({ value: count() }).from(attempts),
    db.select().from(lessons).where(eq(lessons.moduleId, moduleRow.id)).orderBy(asc(lessons.position)),
    db.select({ value: count() }).from(questions).where(eq(questions.moduleId, moduleRow.id)),
    db.select().from(purchases).orderBy(desc(purchases.createdAt)).limit(8),
    db.select().from(feedback).orderBy(desc(feedback.createdAt)).limit(8),
  ]);
  return {
    module: moduleRow,
    students: studentCount[0]?.value ?? 0,
    paid: paidCount[0]?.value ?? 0,
    revenueCents: revenue.reduce((sum, item) => sum + item.amountCents, 0),
    attempts: attemptCount[0]?.value ?? 0,
    lessons: lessonRows,
    questions: questionCount[0]?.value ?? 0,
    recentPurchases,
    feedback: feedbackRows,
  };
}

export { entitlements, modules, paymentEvents, profiles, purchases };
