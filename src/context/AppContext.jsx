/*
 * =====================================================
 * AppContext.jsx - قلب التطبيق وذاكرته المشتركة
 * =====================================================
 *
 * ما هو React Context؟
 * تخيّل Context كـ "إذاعة" داخل التطبيق:
 * - AppProvider = محطة البث (تُرسل البيانات)
 * - useApp()    = راديو (أي مكوّن يريد الاستماع)
 *
 * بدون Context: نحتاج تمرير props من الجد للأب للابن
 * مع Context:   أي مكوّن يأخذ ما يحتاجه مباشرة
 *
 * خارطة البيانات المُدارة هنا:
 * ┌─────────────────────────────────────────┐
 * │  userProfile   → بيانات المستخدم       │
 * │  levelsData    → تقدّم المستويات/المراحل│
 * │  completeStage()→ إنهاء مرحلة + فتح التالية│
 * │  isSoundOn     → حالة الصوت            │
 * │  currentPage   → الصفحة الحالية        │
 * │  pageData      → بيانات الصفحة         │
 * │  navigateTo()  → دالة التنقل           │
 * │  goBack()      → دالة الرجوع           │
 * │  progressPct   → نسبة التقدم الكلي     │
 * └─────────────────────────────────────────┘
 *
 * عند الترحيل لـ Supabase مستقبلاً:
 * كل useState سيتحول لـ fetch/query من قاعدة البيانات
 * =====================================================
 */

import React, {
  createContext,  /* لإنشاء الوعاء (Context object) */
  useContext,     /* لقراءة قيمة الـ Context */
  useState,       /* لتخزين البيانات القابلة للتغيير */
  useCallback,    /* لحفظ الدوال وتجنب إعادة إنشائها */
} from 'react';
import { levelsData as initialLevelsData } from '../data/levels';

/* =====================================================
 * الخطوة 1: إنشاء الـ Context (الوعاء الفارغ)
 * null = القيمة الافتراضية قبل تهيئة الـ Provider
 * ===================================================== */
const AppContext = createContext(null);


/* =====================================================
 * الخطوة 2: AppProvider - المكوّن الغلاف
 * يُحيط بجميع مكونات التطبيق ويوفر البيانات لها
 *
 * الاستخدام في App.jsx:
 * <AppProvider>
 *   <AppContent />  ← يمكنه الوصول لكل البيانات
 * </AppProvider>
 * ===================================================== */
export function AppProvider({ children }) {

  /* --------------------------------------------------
   * حالة 1: الصوت (Sound State)
   * true  = الصوت شغّال
   * false = الصوت مكتوم
   * سيُستخدم لاحقاً مع مكتبة صوت مثل Howler.js
   * -------------------------------------------------- */
  const [isSoundOn, setIsSoundOn] = useState(true);

  /* --------------------------------------------------
   * حالة 2: بيانات المستخدم الشخصية
   *
   * هذا هو "قلب" البيانات في التطبيق.
   * في المستقبل مع Supabase، هذه البيانات ستأتي من:
   * → جدول "profiles" في قاعدة البيانات
   * → عبر: supabase.from('profiles').select('*').eq('id', userId)
   * -------------------------------------------------- */
  const [userProfile, setUserProfile] = useState({
    id:              'user_001',          /* معرّف فريد (UUID في Supabase لاحقاً) */
    name:            'مكتشف',            /* اسم المستخدم في القائمة */
    age:             10,                  /* العمر بالسنوات */
    country:         'مصر',              /* اسم الدولة */
    countryFlag:     '🇪🇬',             /* إيموجي علم الدولة */
    email:           'moktashif@email.com', /* البريد الإلكتروني */
    character:       'boy',               /* الشخصية: 'boy' أو 'girl' */
    currentLevel:    1,                   /* المستوى الحالي (1-5) */
    completedStages: 2,                   /* عدد المراحل المنجزة من أصل 25 */
    totalPoints:     300,                 /* مجموع النقاط المكتسبة */
    rank:            12,                  /* الترتيب في قائمة المتصدرين */
  });

  /* --------------------------------------------------
   * حالة 2.5: تقدّم المستويات والمراحل (Levels & Stages)
   *
   * ⚠️ ملاحظة مهمة عن سبب وجود هذه الحالة:
   * كانت levelsData تُستورَد سابقاً مباشرة من data/levels.js
   * واستُخدمت كمصفوفة ثابتة (Static)، فكان فتح/إغلاق أي مرحلة
   * (isUnlocked / isCompleted) لا يُحدّث الواجهة أبداً لأنها لم
   * تكن جزءاً من useState. الآن أصبحت levelsData بيانات ابتدائية
   * (Seed) فقط تُستخدم لتهيئة هذه الحالة القابلة للتغيير،
   * فتصبح التغييرات (فتح مرحلة/مستوى جديد بعد إكمال السابق) تظهر
   * فوراً في كل الصفحات (الرئيسية، مراحل المستوى، الاختبار).
   *
   * عند الترحيل لـ Supabase مستقبلاً:
   * هذه الحالة ستُقرأ من جدول "user_progress" بدلاً من الملف الثابت
   * -------------------------------------------------- */
  const [levels, setLevels] = useState(initialLevelsData);

  /* --------------------------------------------------
   * حالة 3: نظام التنقل بين الصفحات
   *
   * currentPage: اسم الصفحة الحالية المعروضة
   * الصفحات المتاحة:
   *   'home'        → الصفحة الرئيسية
   *   'quiz-group'  → قائمة مراحل المستوى
   *   'quiz'        → الاختبار الفعلي
   *   'leaderboard' → قائمة المتصدرين
   *   'profile'     → الملف الشخصي
   *
   * pageData: بيانات إضافية تنتقل مع الصفحة
   *   مثال عند الانتقال لـ quiz-group:
   *   pageData = { levelId: 2 }
   * -------------------------------------------------- */
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData,    setPageData]    = useState(null);

  /* --------------------------------------------------
   * حالة 4: سجل التنقل (Navigation History)
   * مصفوفة تحفظ مسار الصفحات للرجوع للخلف
   * مثال: ['home', 'quiz-group'] = جاء من home ثم quiz-group
   * -------------------------------------------------- */
  const [navHistory, setNavHistory] = useState(['home']);


  /* ==================================================
   * الدوال (Functions) - يمكن استدعاؤها من أي مكوّن
   * ==================================================
   *
   * useCallback: يحفظ الدالة ولا يُعيد إنشاءها في كل
   * render، إلا إذا تغيرت القيم في مصفوفة التبعيات []
   * هذا يُحسّن الأداء ويمنع Re-renders غير ضرورية
   */

  /* --------------------------------------------------
   * toggleSound - تبديل الصوت بين مفعّل/مكتوم
   * -------------------------------------------------- */
  const toggleSound = useCallback(() => {
    /* prev = القيمة الحالية، !prev = عكسها */
    setIsSoundOn(prev => !prev);
  }, []); /* [] = لا تعتمد على أي متغير خارجي */

  /* --------------------------------------------------
   * navigateTo - الانتقال لصفحة جديدة
   *
   * @param page {string} - اسم الصفحة المستهدفة
   * @param data {object} - بيانات إضافية (اختياري)
   *
   * مثال الاستخدام:
   * navigateTo('quiz-group', { levelId: 1 })
   * -------------------------------------------------- */
  const navigateTo = useCallback((page, data = null) => {
    /* أضف الصفحة الجديدة لسجل التنقل */
    setNavHistory(prev => [...prev, page]);
    /* غيّر الصفحة الحالية */
    setCurrentPage(page);
    /* احفظ البيانات الإضافية */
    setPageData(data);
    /* ارجع للأعلى عند تغيير الصفحة */
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  /* --------------------------------------------------
   * goBack - الرجوع للصفحة السابقة
   * يستخدم سجل التنقل لمعرفة الصفحة السابقة
   * -------------------------------------------------- */
  const goBack = useCallback(() => {
    setNavHistory(prev => {
      /* إذا كان هناك صفحة سابقة في السجل */
      if (prev.length > 1) {
        /* أنشئ نسخة جديدة من السجل بدون آخر عنصر */
        const newHistory = [...prev];
        newHistory.pop(); /* احذف الصفحة الحالية */

        /* الصفحة التي كنّا فيها قبل الحالية */
        const prevPage = newHistory[newHistory.length - 1];
        setCurrentPage(prevPage);
        setPageData(null);
        window.scrollTo({ top: 0, behavior: 'instant' });
        return newHistory;
      }
      /* إذا لم يكن هناك صفحة سابقة، ابقَ في المكان */
      return prev;
    });
  }, []);

  /* --------------------------------------------------
   * updateUserProfile - تحديث بيانات المستخدم
   *
   * @param updates {object} - الحقول المراد تحديثها فقط
   *
   * مثال: updateUserProfile({ name: 'اسم جديد' })
   * النتيجة: يحدّث name فقط، ويحتفظ بكل الحقول الأخرى
   *
   * عند الترحيل لـ Supabase:
   * supabase.from('profiles').update(updates).eq('id', user.id)
   * -------------------------------------------------- */
  const updateUserProfile = useCallback((updates) => {
    setUserProfile(prev => ({
      ...prev,    /* احتفظ بجميع البيانات الحالية (Spread) */
      ...updates  /* اكتب فوق الحقول المحددة فقط */
    }));
  }, []);

  /* --------------------------------------------------
   * addPoints - إضافة نقاط للمستخدم بعد إكمال مرحلة
   *
   * @param points {number} - عدد النقاط المُكتسبة
   *
   * عند الترحيل لـ Supabase:
   * supabase.rpc('increment_points', { user_id, points })
   * -------------------------------------------------- */
  const addPoints = useCallback((points) => {
    setUserProfile(prev => ({
      ...prev,
      /* اجمع النقاط الحالية مع النقاط الجديدة */
      totalPoints: prev.totalPoints + points
    }));
  }, []);

  /* --------------------------------------------------
   * completeStage - قلب نظام الانتقال بين المراحل ⭐
   *
   * هذه هي الدالة التي كانت مفقودة، وسبب أن إنهاء اختبار
   * لم يكن يفتح المرحلة التالية أو المستوى التالي تلقائياً.
   *
   * @param levelId      {number} - رقم المستوى (1-5)
   * @param stageId      {number} - رقم المرحلة داخل المستوى (1-5)
   * @param earnedPoints {number} - النقاط المُكتسبة في هذه المحاولة
   *
   * ماذا تفعل بالضبط:
   * 1) تُعلّم المرحلة الحالية كمكتملة (isCompleted: true)
   * 2) تحفظ أفضل نتيجة نقاط لهذه المرحلة (لو أعاد المستخدم
   *    المحاولة بنتيجة أقل، لا نُنقص نقاطه)
   * 3) أول مرة تُكتمل فيها المرحلة فقط:
   *    - تفتح المرحلة التالية في نفس المستوى (isUnlocked: true)
   *    - لو كانت آخر مرحلة في المستوى ← تفتح المستوى التالي
   *      بالكامل + أول مرحلة فيه
   *    - تزيد عدّاد completedStages في الملف الشخصي
   * 4) تُحدّث totalPoints بفارق النقاط فقط (delta) حتى لو
   *    أعاد المستخدم المحاولة، فلا تُحتسب النقاط مرتين
   *
   * عند الترحيل لـ Supabase مستقبلاً:
   * supabase.rpc('complete_stage', { user_id, levelId, stageId, earnedPoints })
   * -------------------------------------------------- */
  const completeStage = useCallback((levelId, stageId, earnedPoints) => {
    const level = levels.find(l => l.id === levelId);
    if (!level) return null;

    const stageIndex = level.stages.findIndex(s => s.id === stageId);
    if (stageIndex === -1) return null;

    const stage = level.stages[stageIndex];
    const wasFirstCompletion = !stage.isCompleted;
    const bestPoints = Math.max(stage.earnedPoints, earnedPoints);
    const pointsDelta = bestPoints - stage.earnedPoints;

    /* جهّز مصفوفة المراحل الجديدة لهذا المستوى فقط */
    const newStages = level.stages.map((s, idx) => {
      if (idx === stageIndex) {
        return { ...s, isCompleted: true, earnedPoints: bestPoints };
      }
      /* أول إكمال لهذه المرحلة ← افتح التي تليها مباشرة */
      if (wasFirstCompletion && idx === stageIndex + 1) {
        return { ...s, isUnlocked: true };
      }
      return s;
    });

    const isLastStageOfLevel = stageIndex === newStages.length - 1;
    const allStagesNowCompleted = newStages.every(s => s.isCompleted);
    /* هل هذا الإكمال يفتح مستوى جديداً بالكامل؟ */
    const justUnlockedLevelId =
      (wasFirstCompletion && isLastStageOfLevel && allStagesNowCompleted)
        ? levelId + 1
        : null;

    setLevels(prevLevels => prevLevels.map(lv => {
      if (lv.id === levelId) {
        return { ...lv, stages: newStages, earnedPoints: lv.earnedPoints + pointsDelta };
      }
      if (justUnlockedLevelId && lv.id === justUnlockedLevelId && lv.stages.length > 0) {
        return {
          ...lv,
          isUnlocked: true,
          stages: lv.stages.map((s, idx) => idx === 0 ? { ...s, isUnlocked: true } : s),
        };
      }
      return lv;
    }));

    setUserProfile(prev => ({
      ...prev,
      totalPoints:     prev.totalPoints + pointsDelta,
      completedStages: wasFirstCompletion ? prev.completedStages + 1 : prev.completedStages,
      currentLevel:    justUnlockedLevelId
        ? Math.min(levels.length, Math.max(prev.currentLevel, justUnlockedLevelId))
        : prev.currentLevel,
    }));

    /* نُرجع ملخصاً تستفيد منه صفحة الاختبار مباشرة:
     * - هل توجد مرحلة تالية؟ وأين هي بالضبط؟
     * - هل هذا كان أول إكمال أم إعادة محاولة؟
     * تساعد هذه المعلومة QuizPage على إظهار زر
     * "المرحلة التالية" أو "المستوى التالي" فوراً دون
     * الحاجة للرجوع لقائمة المراحل يدوياً. */
    let nextStage = null;
    if (stageIndex + 1 < level.stages.length) {
      nextStage = { levelId, stageId: level.stages[stageIndex + 1].id };
    } else if (level.stages.length === stageIndex + 1) {
      const nextLevel = levels.find(l => l.id === levelId + 1);
      if (nextLevel && nextLevel.stages.length > 0) {
        nextStage = { levelId: nextLevel.id, stageId: nextLevel.stages[0].id };
      }
    }

    return { wasFirstCompletion, pointsDelta, nextStage, isLastStageOverall: !nextStage };
  }, [levels]);

  /* --------------------------------------------------
   * حساب نسبة التقدم الكلية (0% → 100%)
   *
   * المعادلة:
   * (النقاط المكتسبة ÷ أقصى نقاط ممكنة) × 100
   *
   * أقصى نقاط = 5 مستويات × 100 نقطة = 500 نقطة
   *
   * Math.min(100, ...) = لضمان عدم تجاوز 100%
   * Math.round(...)    = لتقريب لأقرب عدد صحيح
   * -------------------------------------------------- */
  const MAX_TOTAL_POINTS  = 500;  /* 5 مستويات × 100 نقطة لكل مستوى */
  const progressPercentage = Math.min(
    100,
    Math.round((userProfile.totalPoints / MAX_TOTAL_POINTS) * 100)
  );


  /* ==================================================
   * حزمة القيم المُشاركة مع جميع المكوّنات
   * كل ما يُضاف هنا يصبح متاحاً عبر useApp()
   * ================================================== */
  const contextValue = {
    /* بيانات المستخدم */
    userProfile,
    updateUserProfile,
    addPoints,

    /* تقدّم المستويات والمراحل (ديناميكي الآن، وليس ثابتاً) */
    levelsData: levels,
    completeStage,

    /* الصوت */
    isSoundOn,
    toggleSound,

    /* التنقل */
    currentPage,
    pageData,
    navigateTo,
    goBack,
    navHistory,

    /* التقدم */
    progressPercentage,
    MAX_TOTAL_POINTS,
  };

  return (
    /* نُغلّف children بالـ Provider ونمرر له القيم */
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}


/* =====================================================
 * الخطوة 3: useApp - هوك مخصص للوصول السريع
 *
 * بدلاً من كتابة useContext(AppContext) في كل مكوّن،
 * نكتب useApp() فقط.
 *
 * مثال الاستخدام في أي مكوّن:
 * const { userProfile, navigateTo, isSoundOn } = useApp();
 * ===================================================== */
export function useApp() {
  const context = useContext(AppContext);

  /*
   * تحقق مهم للأمان:
   * إذا استُخدم useApp() خارج AppProvider سنرى خطأ واضحاً
   * بدلاً من خطأ محيّر "Cannot read property of null"
   */
  if (!context) {
    throw new Error(
      '❌ useApp() يجب استخدامه داخل <AppProvider> فقط!\n' +
      'راجع ملف App.jsx وتأكد أن المكوّن محاط بـ <AppProvider>'
    );
  }

  return context;
}
