// scripts/seed.js
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { levelsData } from '../src/data/levels.js';
import { quizzesData } from '../src/data/quizzes.js';

// =============================================
// إعداد الاتصال بقاعدة البيانات
// =============================================
console.log('🔑 طول المفتاح السري:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0);
console.log('🔑 أول 10 حروف:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) || 'غير موجود');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// =============================================
// اختبار الاتصال
// =============================================
async function testConnection() {
  console.log('🔍 اختبار الاتصال: محاولة قراءة البيانات من جدول levels...');
  const { data, error } = await supabase.from('levels').select('*').limit(1);
  if (error) {
    console.error('❌ فشلت القراءة:', error);
  } else {
    console.log('✅ نجحت القراءة! عدد الصفوف الموجودة:', data?.length || 0);
  }
}

await testConnection();

// =============================================
// الدالة الرئيسية لرفع البيانات
// =============================================
async function seedDatabase() {
  console.log('\n🔄 بدء رفع البيانات إلى Supabase...\n');

  // =============================================
  // 1. رفع المستويات (Levels) والمراحل (Stages)
  // =============================================
  console.log('📦 رفع المستويات والمراحل...');

  for (const level of levelsData) {
    // التحقق من وجود البيانات الأساسية
    if (!level.id || !level.nameAr) {
      console.error(`❌ المستوى ${level.id || 'غير معروف'} يفتقر إلى الحقل 'nameAr'`);
      continue;
    }

    // رفع المستوى
    const { error: levelError } = await supabase
      .from('levels')
      .upsert({
        id: level.id,
        name_ar: level.nameAr,        // ← استخدم nameAr من الملف
        difficulty: level.nameAr,     // ← استخدم nameAr كوصف للصعوبة
        max_points: level.maxPoints || 100,
      }, { onConflict: 'id' });

    if (levelError) {
      console.error(`❌ خطأ في المستوى ${level.id}:`, levelError.message);
      continue; // تخطي مراحل هذا المستوى إذا فشل
    }
    console.log(`   ✅ المستوى ${level.id}: ${level.nameAr}`);

    // رفع مراحل هذا المستوى (فقط إذا نجح المستوى)
    if (!level.stages || level.stages.length === 0) {
      console.warn(`      ⚠️ لا توجد مراحل للمستوى ${level.id}`);
      continue;
    }

    for (const stage of level.stages) {
      if (!stage.id || !stage.levelId) {
        console.error(`      ❌ المرحلة ${stage.id || 'غير معروف'} تفتقر إلى 'levelId'`);
        continue;
      }

      const { error: stageError } = await supabase
        .from('stages')
        .upsert({
          id: stage.id,
          level_id: stage.levelId,
          title: stage.title,
          order_index: stage.id,
        }, { onConflict: 'id' });

      if (stageError) {
        console.error(`      ❌ خطأ في المرحلة ${stage.id}:`, stageError.message);
      } else {
        console.log(`      ✅ المرحلة ${stage.id}: ${stage.title}`);
      }
    }
  }

  // =============================================
  // 2. رفع الأسئلة (Questions)
  // =============================================
  console.log('\n📝 رفع الأسئلة...');
  let totalQuestions = 0;

  for (const quiz of quizzesData) {
    // التحقق من وجود stageId
    if (!quiz.stageId) {
      console.warn(`   ⚠️ تخطي مجموعة أسئلة بدون stageId`);
      continue;
    }

    // التحقق من وجود أسئلة
    if (!quiz.questions || quiz.questions.length === 0) {
      console.warn(`   ⚠️ لا توجد أسئلة للمرحلة ${quiz.stageId}`);
      continue;
    }

    for (const q of quiz.questions) {
      // التحقق من البيانات المطلوبة لكل سؤال
      if (!q.id || !q.question || !q.options || q.correctIndex === undefined) {
        console.error(`   ❌ السؤال ${q.id || 'غير معروف'} يفتقر إلى بيانات مطلوبة`);
        continue;
      }

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

// =============================================
// تشغيل السكريبت
// =============================================
seedDatabase();