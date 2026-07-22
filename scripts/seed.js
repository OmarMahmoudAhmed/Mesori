// scripts/seed.js
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
console.log('🔑 طول المفتاح السري:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length);
console.log('🔑 أول 10 حروف:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10));
import { levelsData } from '../src/data/levels.js';
import { quizzesData } from '../src/data/quizzes.js';

console.log('📌 طول المفتاح السري:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0);

// الاتصال بقاعدة البيانات باستخدام المفتاح السري (آمن، بيشتغل على جهازك بس)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function seedDatabase() {
  console.log('🔄 بدء رفع البيانات إلى Supabase...\n');

  // =============================================
  // 1. رفع المستويات (Levels) والمراحل (Stages)
  // =============================================
  console.log('📦 رفع المستويات والمراحل...');
  for (const level of levelsData) {
    // رفع المستوى
    const { error: levelError } = await supabase
      .from('levels')
      .upsert({
        id: level.id,
        name_ar: level.name_ar,
        difficulty: level.difficulty,
        max_points: level.maxPoints,
      }, { onConflict: 'id' });

    if (levelError) {
      console.error(`❌ خطأ في المستوى ${level.id}:`, levelError.message);
    } else {
      console.log(`   ✅ المستوى ${level.id}: ${level.name_ar}`);
    }

    // رفع مراحل هذا المستوى
    for (const stage of level.stages) {
      const { error: stageError } = await supabase
        .from('stages')
        .upsert({
          id: stage.id,
          level_id: stage.levelId,
          title: stage.title,
          order_index: stage.id, // أو أي ترتيب تفضله
        }, { onConflict: 'id' });

      if (stageError) {
        console.error(`      ❌ خطأ في المرحلة ${stage.id}:`, stageError.message);
      } else {
        console.log(`      ✅ المرحلة ${stage.id}: ${stage.title}`);
      }
    }
  }

  // =============================================
  // 2. رفع الأسئلة (Questions) - كل الـ 250 سؤال
  // =============================================
  console.log('\n📝 رفع الأسئلة...');
  let totalQuestions = 0;

  for (const quiz of quizzesData) {
    // quiz = { levelId, stageId, questions: [...] }
    for (const q of quiz.questions) {
      const { error: qError } = await supabase
        .from('questions')
        .upsert({
          id: q.id,
          stage_id: quiz.stageId,
          question: q.question,
          options: q.options,
          correct_index: q.correctIndex,
        }, { onConflict: 'id' });

      if (qError) {
        console.error(`   ❌ خطأ في السؤال ${q.id}:`, qError.message);
      } else {
        totalQuestions++;
      }
    }
    console.log(`   ✅ تم رفع أسئلة المرحلة ${quiz.stageId} (${quiz.questions.length} سؤال)`);
  }

  console.log(`\n🎉 تم رفع ${totalQuestions} سؤال بنجاح!`);
  console.log('✅ اكتمل رفع كل البيانات.');
}

// تشغيل السكريبت
seedDatabase();