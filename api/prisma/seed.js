"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const mock_data_1 = require("../src/data/mock-data");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.$transaction([
        prisma.progress.deleteMany(),
        prisma.enrollment.deleteMany(),
        prisma.video.deleteMany(),
        prisma.chapter.deleteMany(),
        prisma.course.deleteMany(),
        prisma.user.deleteMany(),
        prisma.uploadAsset.deleteMany(),
    ]);
    const userIdMap = new Map();
    const courseIdMap = new Map();
    const videoIdMap = new Map();
    for (const user of mock_data_1.USERS) {
        const created = await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                role: user.role === 'admin' ? client_1.UserRole.admin : client_1.UserRole.student,
                status: user.status === 'inactive' ? client_1.UserStatus.inactive : client_1.UserStatus.active,
            },
        });
        userIdMap.set(user.id, created.id);
    }
    for (const course of mock_data_1.COURSES) {
        const createdCourse = await prisma.course.create({
            data: {
                title: course.title,
                thumbnailUrl: course.thumbnail,
            },
        });
        courseIdMap.set(course.id, createdCourse.id);
    }
    for (const chapterGroup of mock_data_1.CURRICULUM) {
        const courseId = courseIdMap.get(chapterGroup.id);
        if (!courseId) {
            continue;
        }
        const createdChapter = await prisma.chapter.create({
            data: {
                courseId,
                order: chapterGroup.order,
                title: chapterGroup.title,
            },
        });
        for (const video of chapterGroup.videos) {
            const createdVideo = await prisma.video.create({
                data: {
                    chapterId: createdChapter.id,
                    order: video.order,
                    title: video.title,
                    duration: video.duration,
                    assetKey: `seed/${video.id}.mp4`,
                },
            });
            videoIdMap.set(video.id, createdVideo.id);
        }
    }
    for (const user of mock_data_1.USERS) {
        const createdUserId = userIdMap.get(user.id);
        if (!createdUserId) {
            continue;
        }
        for (const courseId of user.courses) {
            const createdCourseId = courseIdMap.get(courseId);
            if (!createdCourseId) {
                continue;
            }
            await prisma.enrollment.create({
                data: {
                    userId: createdUserId,
                    courseId: createdCourseId,
                },
            });
        }
    }
    for (const [userId, courses] of Object.entries(mock_data_1.USER_PROGRESS)) {
        const createdUserId = userIdMap.get(Number(userId));
        if (!createdUserId) {
            continue;
        }
        for (const [courseId, progress] of Object.entries(courses)) {
            const createdCourseId = courseIdMap.get(Number(courseId));
            const chapter = mock_data_1.CURRICULUM.find((entry) => entry.id === Number(courseId));
            const firstVideoId = chapter?.videos[0]?.id;
            const createdVideoId = firstVideoId ? videoIdMap.get(firstVideoId) : undefined;
            if (!createdCourseId || !createdVideoId) {
                continue;
            }
            await prisma.progress.create({
                data: {
                    userId: createdUserId,
                    courseId: createdCourseId,
                    videoId: createdVideoId,
                    percent: progress.progress,
                    completed: progress.progress >= 100,
                    lastWatchedAt: new Date(),
                },
            });
        }
    }
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
