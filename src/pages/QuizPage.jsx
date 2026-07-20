/*
 * =====================================================
 * QuizPage.jsx - صفحة الاختبار الفعلي
 * =====================================================
 *
 * هذه الصفحة تظهر عند الضغط على "ابدأ" في QuizGroupPage.
 * تعرض أسئلة المرحلة المحددة واحداً تلو الآخر:
 *
 * ┌─────────────────────────────────────────────────┐
 * │  <رجوع                              [إعدادات]   │
 * │        [Level 1]  🏜️ البدايات                   │
 * │        السؤال 3 من 10        2 إجابة صحيحة       │
 * │        ██████████░░░░░░░░░░░░░░░░░░░░           │
 * │  ┌───────────────────────────────────────────┐  │
 * │  │        ما هو النهر الذي قامت حوله...       │  │
 * │  └───────────────────────────────────────────┘  │
 * │  ┌───────────────────────────────────────────┐  │
 * │  │  نهر الفرات                                │  │
 * │  ├───────────────────────────────────────────┤  │
 * │  │  نهر النيل                          ✓      │  │  ← بعد الإجابة
 * │  ├───────────────────────────────────────────┤  │
 * │  │  نهر دجلة                                  │  │
 * │  └───────────────────────────────────────────┘  │
 * │  💬 إجابة صحيحة! ... (معلومة إضافية)            │
 * │  [       السؤال التالي        →]               │
 * └─────────────────────────────────────────────────┘
 *
 * بعد آخر سؤال تظهر شاشة النتيجة النهائية بدلاً من ذلك:
 * الدرجة + النقاط المكتسبة + إعادة المحاولة / العودة للمراحل.
 *
 * من أين تأتي بيانات هذه الصفحة؟
 * ─────────────────────────────────────────────
 * pageData = { levelId, stageId } تُمرَّر من QuizGroupPage عبر:
 * navigateTo('quiz', { levelId, stageId })
 *
 * أسئلة كل مرحلة تأتي من src/data/quizzes.js (بيانات وهمية
 * حالياً — راجع خطوة "إضافة الأسئلة الحقيقية في ملفات JSON"
 * القادمة في README.md). لو مرحلة معينة لسه مفيش لها أسئلة في
 * quizzes.js، تظهر شاشة "غير متاح بعد" بدل أي خطأ في الكود.
 *
 * حساب النقاط:
 * ─────────────────────────────────────────────
 * نقاط كل سؤال = (أقصى نقاط المستوى ÷ عدد مراحله) ÷ عدد أسئلة
 * المرحلة. بأرقام المستوى 1 الحالية: (100 ÷ 5) ÷ 10 = 2 نقطة
 * لكل إجابة صحيحة. الحساب ديناميكي من levels.js، مش رقم ثابت،
 * فلو غيّرت maxPoints أو عدد الأسئلة هيتحدّث تلقائياً.
 *
 * ملاحظة تصميم: هذه الصفحة لا تعرض BottomNav عمداً — الهدف
 * تركيز المستخدم أثناء الاختبار ومنع خروجه بالخطأ عبر أزرار
 * التنقل السفلي بدون تحذير. زر "رجوع" في الهيدر هو المخرج
 * الوحيد أثناء الأسئلة، وهو محمي بنافذة تأكيد (showExitConfirm)
 * حتى لا يفقد المستخدم تقدمه بضغطة واحدة بالخطأ.
 *
 * ⚠️ ما لم تفعله هذه الصفحة عمداً:
 * لا تُقفل/تفتح المراحل تلقائياً في levels.js بعد إكمال الاختبار
 * (isUnlocked / isCompleted تبقى كما هي). السبب: levelsData حالياً
 * مصفوفة ثابتة تُستورَد مباشرة، مش جزء من useState في Context،
 * فتعديلها هنا لن يُحدّث الواجهة بشكل صحيح، وربط ذلك بنظام تقدم
 * حقيقي هو تحديداً خطوة "نظام النقاط والمكافآت" القادمة في الخطة.
 * ما يحدث فعلاً الآن: addPoints() من AppContext تُستدعى وتُحدّث
 * userProfile.totalPoints (وتظهر فوراً في ProgressSection بالصفحة
 * الرئيسية).
 * =====================================================
 */

import React, { useState } from 'react';
import AppWrapper        from '../components/layout/AppWrapper';
import Header            from '../components/layout/Header';
import ExplorerCharacter from '../components/shared/ExplorerCharacter';
import { useApp }        from '../context/AppContext';
import { levelsData }    from '../data/levels';
import { quizzesData }   from '../data/quizzes';


/*
 * AnswerOption - زر اختيار واحد من اختيارات السؤال
 * ─────────────────────────────────────────────
 * أربع حالات بصرية ممكنة (state):
 *   'default'   → لسه ماحدش اختار (أبيض عادي)
 *   'correct'   → هذا هو الاختيار الصحيح (يظهر دائماً أخضر بعد الإجابة)
 *   'incorrect' → هذا ما اختاره المستخدم وكان غلط (أحمر)
 *   'dimmed'    → اختيار آخر غير مُختار وغير صحيح (باهت)
 */
function AnswerOption({ text, state, onClick, disabled }) {

  const stateStyles = {
    default:   { bg: '#FFFFFF',                border: 'rgba(200,146,42,0.3)', text: '#3D2B1F', opacity: 1    },
    correct:   { bg: 'rgba(45,106,63,0.1)',     border: '#2D6A3F',              text: '#2D6A3F', opacity: 1    },
    incorrect: { bg: 'rgba(220,38,38,0.08)',    border: '#DC2626',              text: '#DC2626', opacity: 1    },
    dimmed:    { bg: '#FFFFFF',                 border: 'rgba(150,150,150,0.2)',text: '#9CA3AF', opacity: 0.5  },
  };
  const s = stateStyles[state];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        w-full flex items-center justify-between gap-3
        px-4 py-3.5 rounded-2xl
        press-effect no-tap-highlight
        transition-colors duration-200
      "
      style={{
        backgroundColor: s.bg,
        border:          `2px solid ${s.border}`,
        opacity:         s.opacity,
        cursor:          disabled ? 'default' : 'pointer',
      }}
    >
      <span
        className="font-bold text-sm flex-1 text-right"
        style={{ fontFamily: "'Cairo', sans-serif", color: s.text }}
      >
        {text}
      </span>

      {/* دائرة صح خضراء بجانب الاختيار الصحيح */}
      {state === 'correct' && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#2D6A3F' }}
        >
          <i className="fi fi-rr-check" aria-hidden="true" style={{ fontSize: '11px', color: '#FFFFFF' }} />
        </div>
      )}

      {/* دائرة خطأ حمراء بجانب اختيار المستخدم الغلط */}
      {state === 'incorrect' && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#DC2626' }}
        >
          <i className="fi fi-rr-cross" aria-hidden="true" style={{ fontSize: '11px', color: '#FFFFFF' }} />
        </div>
      )}
    </button>
  );
}


function QuizPage() {

  /*
   * نجلب من Context:
   * pageData     = { levelId, stageId } المُمررة من QuizGroupPage
   * userProfile  = لعرض شخصية المستخدم في شاشة النتيجة
   * navigateTo   = للانتقال لصفحة اختيار المرحلة بعد الانتهاء
   * goBack       = للرجوع الفعلي بعد تأكيد الخروج
   * addPoints    = لإضافة النقاط المكتسبة لرصيد المستخدم
   */
  const { pageData, userProfile, navigateTo, goBack, addPoints } = useApp();

  /* احتياطياً: لو دخل حد الصفحة من غير pageData صحيحة، نفترض المرحلة الأولى */
  const levelId = pageData?.levelId ?? 1;
  const stageId = pageData?.stageId ?? 1;

  /* نجد بيانات المستوى والمرحلة (نفس أسلوب البحث في QuizGroupPage) */
  const currentLevel = levelsData.find(l => l.id === levelId) || levelsData[0];
  const currentStage = currentLevel.stages.find(s => s.id === stageId) || currentLevel.stages[0];

  /* نجد أسئلة هذه المرحلة تحديداً في quizzes.js */
  const quiz = quizzesData.find(q => q.levelId === levelId && q.stageId === stageId);


  /* --------------------------------------------------
   * حالة الاختبار (Local State)
   * currentQuestionIndex → رقم السؤال الحالي (0 = الأول)
   * selectedIndex        → رقم الاختيار الذي ضغط عليه المستخدم
   *                         (null = لسه ما جاوبش على السؤال الحالي)
   * correctCount          → عدد الإجابات الصحيحة حتى الآن
   * isFinished            → true بعد آخر سؤال (تظهر شاشة النتيجة)
   * showExitConfirm        → true لإظهار نافذة "متأكد إنك عايز تخرج؟"
   * -------------------------------------------------- */
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedIndex,        setSelectedIndex]        = useState(null);
  const [correctCount,         setCorrectCount]         = useState(0);
  const [isFinished,           setIsFinished]           = useState(false);
  const [showExitConfirm,      setShowExitConfirm]      = useState(false);


  /*
   * ===================================================
   * حالة خاصة: لا توجد أسئلة لهذه المرحلة بعد
   * ===================================================
   * يحدث هذا لو أضفت مرحلة جديدة في levels.js وفتحتها
   * (isUnlocked: true) قبل ما تضيف أسئلتها في quizzes.js.
   * بدل ما تنهار الصفحة، نعرض رسالة واضحة ونرجّعه بأمان.
   */
  if (!quiz) {
    return (
      <AppWrapper>
        <Header showBack={true} onBack={goBack} />
        <main
          className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center"
          style={{ paddingBottom: '48px' }}
        >
          <i className="fi fi-rr-hourglass-start" aria-hidden="true" style={{ fontSize: '46px', color: '#C8922A' }} />
          <h2 className="font-black text-xl" style={{ fontFamily: "'Cairo', sans-serif", color: '#3D2B1F' }}>
            هذا الاختبار غير متاح بعد
          </h2>
          <p className="text-sm leading-relaxed" style={{ fontFamily: "'Cairo', sans-serif", color: '#8B5A2B' }}>
            سيتم إضافة أسئلة مرحلة "{currentStage?.title}" قريباً.
          </p>
          <button
            onClick={goBack}
            className="mt-2 px-6 py-3 rounded-2xl font-bold text-white press-effect no-tap-highlight"
            style={{ backgroundColor: '#2D6A3F', fontFamily: "'Cairo', sans-serif" }}
          >
            الرجوع لقائمة المراحل
          </button>
        </main>
      </AppWrapper>
    );
  }


  /* --------------------------------------------------
   * قيم مُشتقة (Derived Values) - تُحسب من الحالة الحالية
   * -------------------------------------------------- */
  const questions       = quiz.questions;
  const totalQuestions  = questions.length || 1;
  const question        = questions[currentQuestionIndex];
  const isAnswered       = selectedIndex !== null;
  const isCorrectAnswer  = selectedIndex === question.correctIndex;
  const isLastQuestion   = currentQuestionIndex === totalQuestions - 1;

  /* نقاط كل سؤال، محسوبة ديناميكياً من بيانات المستوى (راجع الشرح أعلى الملف) */
  const pointsPerQuestion = Math.max(
    1,
    Math.round((currentLevel.maxPoints / (currentLevel.totalStages || 1)) / totalQuestions)
  );

  /* نسبة تقدم شريط التقدم: تقفز فوراً عند الإجابة، مش عند الضغط على "التالي" فقط */
  const progressPercentage = Math.round(
    ((currentQuestionIndex + (isAnswered ? 1 : 0)) / totalQuestions) * 100
  );


  /*
   * getOptionState - تحدّد الشكل البصري لكل اختيار
   * @param index {number} - رقم الاختيار في مصفوفة options
   */
  const getOptionState = (index) => {
    if (!isAnswered) return 'default';
    if (index === question.correctIndex) return 'correct';
    if (index === selectedIndex) return 'incorrect';
    return 'dimmed';
  };


  /* --------------------------------------------------
   * handleSelectOption - عند ضغط المستخدم على اختيار
   * -------------------------------------------------- */
  const handleSelectOption = (index) => {
    if (isAnswered) return; /* منع تغيير الإجابة بعد اختيارها */
    setSelectedIndex(index);
    if (index === question.correctIndex) {
      setCorrectCount(prev => prev + 1);
    }
  };


  /* --------------------------------------------------
   * handleNext - الانتقال للسؤال التالي، أو لشاشة النتيجة
   * لو كان هذا آخر سؤال
   * -------------------------------------------------- */
  const handleNext = () => {
    if (isLastQuestion) {
      /*
       * correctCount هنا محدّثة بالفعل وتشمل السؤال الأخير،
       * لأن اختيار الإجابة (handleSelectOption) يحدث في ضغطة
       * منفصلة وسابقة لظهور زر "عرض النتيجة" أصلاً
       */
      addPoints(correctCount * pointsPerQuestion);
      setIsFinished(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedIndex(null);
    }
  };


  /* --------------------------------------------------
   * handleRetry - إعادة الاختبار من السؤال الأول
   * -------------------------------------------------- */
  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedIndex(null);
    setCorrectCount(0);
    setIsFinished(false);
  };

  /* العودة لقائمة مراحل نفس المستوى */
  const handleBackToStages = () => {
    navigateTo('quiz-group', { levelId });
  };

  /*
   * handleBackPress - ضغطة زر "رجوع" في الهيدر
   * أثناء الأسئلة: نعرض تأكيد الخروج (منعاً لفقدان التقدم بالخطأ)
   * في شاشة النتيجة: لا يوجد تقدم لنخسره، فنرجع مباشرة
   */
  const handleBackPress = () => {
    if (isFinished) {
      goBack();
    } else {
      setShowExitConfirm(true);
    }
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    goBack();
  };


  /* --------------------------------------------------
   * رسالة شاشة النتيجة - تختلف حسب نسبة الإجابات الصحيحة
   * -------------------------------------------------- */
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
  const resultMessage =
    scorePercentage === 100 ? 'ممتاز! أنت مؤرخ مصري حقيقي!' :
    scorePercentage >= 70   ? 'أحسنت! معرفتك بتاريخ مصر القديمة رائعة!' :
    scorePercentage >= 40   ? 'جيد! استمر في التعلم واكتشف المزيد!' :
                               'لا بأس، حاول مرة أخرى وستتحسن بالتأكيد!';

  const finalPoints = correctCount * pointsPerQuestion;


  return (
    <AppWrapper>
      <Header showBack={true} onBack={handleBackPress} />

      {isFinished ? (

        /* =====================================================
         * شاشة النتيجة النهائية
         * ===================================================== */
        <main
          className="flex-1 overflow-y-auto app-scroll flex flex-col items-center justify-center px-6"
          style={{ paddingBottom: '32px' }}
        >
          <div className="w-full flex flex-col items-center animate-fade-in-up">

            {/* نجوم زخرفية */}
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: '#C8922A', fontSize: '9px' }}>✦</span>
              <span style={{ color: '#C8922A', fontSize: '15px' }}>✦</span>
              <span style={{ color: '#C8922A', fontSize: '9px' }}>✦</span>
            </div>

            <ExplorerCharacter size={100} gender={userProfile.character} />

            <h2
              className="font-black text-xl mt-3 text-center px-4"
              style={{ fontFamily: "'Cairo', sans-serif", color: '#3D2B1F' }}
            >
              {resultMessage}
            </h2>
            <p
              className="text-sm mt-1 text-center"
              style={{ fontFamily: "'Cairo', sans-serif", color: '#8B4513' }}
            >
              أكملت مرحلة "{currentStage?.title}"
            </p>

            {/* دائرة الدرجة */}
            <div
              className="mt-6 mb-4 w-32 h-32 rounded-full flex flex-col items-center justify-center"
              style={{
                backgroundColor: currentLevel.bgColor,
                border:          `4px solid ${currentLevel.badgeText}`,
              }}
            >
              <span
                className="font-black text-3xl text-white"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                {correctCount}/{totalQuestions}
              </span>
              <span
                className="text-xs font-semibold mt-0.5"
                style={{ fontFamily: "'Cairo', sans-serif", color: currentLevel.badgeText }}
              >
                إجابة صحيحة
              </span>
            </div>

            {/* النقاط المكتسبة */}
            <div
              className="flex items-center gap-2 px-5 py-2.5 rounded-full mb-8"
              style={{ backgroundColor: '#FDF3E3', border: '1px solid rgba(200,146,42,0.3)' }}
            >
              <i className="fi fi-rr-star" aria-hidden="true" style={{ fontSize: '15px', color: '#C8922A' }} />
              <span
                className="font-bold text-sm"
                style={{ fontFamily: "'Cairo', sans-serif", color: '#3D2B1F' }}
              >
                +{finalPoints} نقطة
              </span>
            </div>

            {/* أزرار الإجراءات */}
            <div className="w-full flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 py-3.5 rounded-2xl font-bold press-effect no-tap-highlight"
                style={{ backgroundColor: '#F3F4F6', color: '#6B7280', fontFamily: "'Cairo', sans-serif" }}
              >
                إعادة المحاولة
              </button>
              <button
                onClick={handleBackToStages}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white press-effect no-tap-highlight"
                style={{ backgroundColor: '#2D6A3F', fontFamily: "'Cairo', sans-serif" }}
              >
                العودة للمراحل
              </button>
            </div>
          </div>
        </main>

      ) : (

        /* =====================================================
         * شاشة السؤال الحالي
         * ===================================================== */
        <main
          className="flex-1 overflow-y-auto app-scroll"
          style={{ paddingBottom: '32px' }}
        >

          {/* ===== شارة المستوى + اسم المرحلة ===== */}
          <div className="px-4 pt-1 flex items-center justify-center gap-2 mb-3">
            <div
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: currentLevel.headerBg }}
            >
              <span
                className="font-bold text-white"
                style={{ fontFamily: "'Cinzel', serif", fontSize: '11px' }}
              >
                {currentLevel.nameEn}
              </span>
            </div>
            <span
              className="font-bold text-sm"
              style={{ fontFamily: "'Cairo', sans-serif", color: '#3D2B1F' }}
            >
              {currentStage?.emoji} {currentStage?.title}
            </span>
          </div>

          {/* ===== عداد الأسئلة + شريط التقدم ===== */}
          <div className="px-4 mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-xs font-bold"
                style={{ fontFamily: "'Cairo', sans-serif", color: '#8B5A2B' }}
              >
                السؤال {currentQuestionIndex + 1} من {totalQuestions}
              </span>
              <span
                className="text-xs font-bold"
                style={{ fontFamily: "'Cairo', sans-serif", color: '#8B5A2B' }}
              >
                {correctCount} إجابة صحيحة
              </span>
            </div>
            <div
              dir="ltr"
              className="w-full h-2.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(61,43,31,0.15)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%`, backgroundColor: currentLevel.bgColor }}
              />
            </div>
          </div>


          {/* ===== بطاقة السؤال + الاختيارات (key تُعيد تشغيل الأنيميشن مع كل سؤال جديد) ===== */}
          <div key={question.id} className="animate-fade-in-up">

            <div className="px-4 mb-4">
              <div
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: 'white',
                  border:          '1px solid rgba(200,146,42,0.2)',
                  boxShadow:       '0 4px 15px rgba(61,43,31,0.08)',
                }}
              >
                <p
                  className="font-black text-lg leading-relaxed text-center"
                  style={{ fontFamily: "'Cairo', sans-serif", color: '#3D2B1F' }}
                >
                  {question.question}
                </p>
              </div>
            </div>

            <div className="px-4 space-y-3">
              {question.options.map((option, index) => (
                <AnswerOption
                  key={index}
                  text={option}
                  state={getOptionState(index)}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(index)}
                />
              ))}
            </div>
          </div>


          {/* ===== شريط التغذية الراجعة + زر المتابعة (يظهران فقط بعد الإجابة) ===== */}
          {isAnswered && (
            <div className="px-4 mt-4 animate-fade-in-up">

              <div
                className="rounded-2xl p-4 mb-4"
                style={{
                  backgroundColor: isCorrectAnswer ? 'rgba(45,106,63,0.08)' : 'rgba(220,38,38,0.06)',
                  border:          `1.5px solid ${isCorrectAnswer ? 'rgba(45,106,63,0.3)' : 'rgba(220,38,38,0.3)'}`,
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <i
                    className={isCorrectAnswer ? 'fi fi-rr-check-circle' : 'fi fi-rr-cross-circle'}
                    aria-hidden="true"
                    style={{ fontSize: '17px', color: isCorrectAnswer ? '#2D6A3F' : '#DC2626' }}
                  />
                  <span
                    className="font-black text-sm"
                    style={{ fontFamily: "'Cairo', sans-serif", color: isCorrectAnswer ? '#2D6A3F' : '#DC2626' }}
                  >
                    {isCorrectAnswer
                      ? 'إجابة صحيحة!'
                      : `إجابة خاطئة، الصحيحة: ${question.options[question.correctIndex]}`}
                  </span>
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ fontFamily: "'Cairo', sans-serif", color: '#8B5A2B' }}
                >
                  {question.explanation}
                </p>
              </div>

              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white press-effect no-tap-highlight"
                style={{ backgroundColor: '#2D6A3F', fontFamily: "'Cairo', sans-serif" }}
              >
                {isLastQuestion ? 'عرض النتيجة' : 'السؤال التالي'}
                <i className="fi fi-rr-arrow-small-right" aria-hidden="true" style={{ fontSize: '13px', color: '#FFFFFF' }} />
              </button>
            </div>
          )}

        </main>
      )}


      {/* ===== نافذة تأكيد الخروج (تظهر فقط أثناء الأسئلة، وليس في شاشة النتيجة) ===== */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', maxWidth: '448px', left: '50%', transform: 'translateX(-50%)' }}
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            className="w-full rounded-t-3xl p-6"
            style={{ backgroundColor: 'white' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="font-bold text-lg mb-2 text-center"
              style={{ fontFamily: "'Cairo', sans-serif", color: '#3D2B1F' }}
            >
              الخروج من الاختبار؟
            </h3>
            <p
              className="text-sm text-center mb-4"
              style={{ fontFamily: "'Cairo', sans-serif", color: '#8B5A2B' }}
            >
              لو خرجت الآن، ستفقد تقدمك في هذا الاختبار.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 rounded-xl font-bold text-white"
                style={{ fontFamily: "'Cairo', sans-serif", backgroundColor: '#2D6A3F' }}
              >
                متابعة الاختبار
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 py-3 rounded-xl font-bold"
                style={{ fontFamily: "'Cairo', sans-serif", backgroundColor: '#F3F4F6', color: '#6B7280' }}
              >
                الخروج
              </button>
            </div>
          </div>
        </div>
      )}

    </AppWrapper>
  );
}

export default QuizPage;
