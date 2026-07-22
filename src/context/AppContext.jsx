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
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { levelsData as initialLevelsData } from '../data/levels';
import { supabase } from '../lib/supabaseClient';

const AppContext = createContext(null);

export function AppProvider({ children }) {

  // ---- حالة الصوت ----
  const [isSoundOn, setIsSoundOn] = useState(true);

  // ---- بيانات المستخدم ----
  const [userProfile, setUserProfile] = useState({
    id:              'user_001',
    name:            'مكتشف',
    age:             10,
    country:         'مصر',
    countryFlag:     '🇪🇬',
    email:           'moktashif@email.com',
    character:       'boy',
    currentLevel:    1,
    completedStages: 2,
    totalPoints:     300,
    rank:            12,
  });

  // ---- حالة المستويات والمراحل ----
  const [levels, setLevels] = useState(initialLevelsData);

  // ---- نظام التنقل ----
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData,    setPageData]    = useState(null);
  const [navHistory, setNavHistory] = useState(['home']);

  // =============================================
  // تحميل المستويات والمراحل من Supabase
  // =============================================
  useEffect(() => {
    async function loadLevels() {
      try {
        console.log('🔄 تحميل المستويات والمراحل من Supabase...');

        // 1. جلب المستويات مع مراحلهم
        const { data: levelsData, error: levelsError } = await supabase
          .from('levels')
          .select(`
            id,
            name_ar,
            name_en,
            difficulty,
            max_points,
            stages: stages (
              id,
              level_id,
              title,
              description,
              order_index,
              emoji
            )
          `)
          .order('id');

        if (levelsError) {
          console.error('❌ خطأ في تحميل المستويات:', levelsError);
          return;
        }

        if (!levelsData || levelsData.length === 0) {
          console.warn('⚠️ لا توجد بيانات مستويات في قاعدة البيانات. استخدم البيانات الثابتة.');
          return;
        }

        // 2. تحويل البيانات إلى الشكل المتوقع من المكونات
        const formattedLevels = levelsData.map(level => {
          // ترتيب المراحل حسب order_index
          const stages = (level.stages || [])
            .sort((a, b) => a.order_index - b.order_index)
            .map(stage => ({
              id: stage.id,
              levelId: stage.level_id,
              title: stage.title,
              description: stage.description || '',
              emoji: stage.emoji || '📚',
              // حالة المرحلة (مقفولة/مفتوحة/مكتملة) سنحددها لاحقاً
              isUnlocked: false,
              isCompleted: false,
              earnedPoints: 0,
              unlockCondition: null,
            }));

          return {
            id: level.id,
            nameAr: level.name_ar,
            nameEn: level.name_en || `Level ${level.id}`,
            difficulty: level.difficulty,
            maxPoints: level.max_points || 100,
            totalStages: stages.length,
            isUnlocked: level.id === 1, // المستوى الأول مفتوح دائماً
            earnedPoints: 0,
            stages: stages,
            // خصائص إضافية للتنسيق (لن تُستخدم في قاعدة البيانات)
            iconSrc: `/assets/icons/levels/level-${level.id}.png`,
            bgColor: '#1B5E2E',
            headerBg: '#143F20',
            textColor: '#4ADE80',
            iconBg: '#0F2D18',
            badgeBg: '#0F2D18',
            badgeText: '#86EFAC',
            quizCount: 10,
          };
        });

        // 3. فتح المرحلة الأولى من المستوى الأول
        if (formattedLevels.length > 0 && formattedLevels[0].stages.length > 0) {
          formattedLevels[0].stages[0].isUnlocked = true;
        }

        console.log(`✅ تم تحميل ${formattedLevels.length} مستويات و ${formattedLevels.reduce((acc, l) => acc + l.stages.length, 0)} مراحل.`);
        setLevels(formattedLevels);

      } catch (error) {
        console.error('❌ خطأ غير متوقع في تحميل المستويات:', error);
      }
    }

    loadLevels();
  }, []); // [] = يتم التنفيذ مرة واحدة فقط عند تحميل المكون

  // =============================================
  // الدوال (Functions)
  // =============================================

  const toggleSound = useCallback(() => {
    setIsSoundOn(prev => !prev);
  }, []);

  const navigateTo = useCallback((page, data = null) => {
    setNavHistory(prev => [...prev, page]);
    setCurrentPage(page);
    setPageData(data);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const goBack = useCallback(() => {
    setNavHistory(prev => {
      if (prev.length > 1) {
        const newHistory = [...prev];
        newHistory.pop();
        const prevPage = newHistory[newHistory.length - 1];
        setCurrentPage(prevPage);
        setPageData(null);
        window.scrollTo({ top: 0, behavior: 'instant' });
        return newHistory;
      }
      return prev;
    });
  }, []);

  const updateUserProfile = useCallback((updates) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const addPoints = useCallback((points) => {
    setUserProfile(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + points
    }));
  }, []);

  const completeStage = useCallback((levelId, stageId, earnedPoints) => {
    const level = levels.find(l => l.id === levelId);
    if (!level) return null;

    const stageIndex = level.stages.findIndex(s => s.id === stageId);
    if (stageIndex === -1) return null;

    const stage = level.stages[stageIndex];
    const wasFirstCompletion = !stage.isCompleted;
    const bestPoints = Math.max(stage.earnedPoints, earnedPoints);
    const pointsDelta = bestPoints - stage.earnedPoints;

    const newStages = level.stages.map((s, idx) => {
      if (idx === stageIndex) {
        return { ...s, isCompleted: true, earnedPoints: bestPoints };
      }
      if (wasFirstCompletion && idx === stageIndex + 1) {
        return { ...s, isUnlocked: true };
      }
      return s;
    });

    const isLastStageOfLevel = stageIndex === newStages.length - 1;
    const allStagesNowCompleted = newStages.every(s => s.isCompleted);
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

  const MAX_TOTAL_POINTS  = 500;
  const progressPercentage = Math.min(
    100,
    Math.round((userProfile.totalPoints / MAX_TOTAL_POINTS) * 100)
  );

  const contextValue = {
    userProfile,
    updateUserProfile,
    addPoints,
    levelsData: levels,
    completeStage,
    isSoundOn,
    toggleSound,
    currentPage,
    pageData,
    navigateTo,
    goBack,
    navHistory,
    progressPercentage,
    MAX_TOTAL_POINTS,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error(
      '❌ useApp() يجب استخدامه داخل <AppProvider> فقط!\n' +
      'راجع ملف App.jsx وتأكد أن المكوّن محاط بـ <AppProvider>'
    );
  }
  return context;
}