/*
 * =====================================================
 * App.jsx - المكوّن الجذر للتطبيق
 * =====================================================
 *
 * هذا الملف هو "محطة التوزيع" الرئيسية.
 * يقوم بـ:
 * 1. تغليف التطبيق بـ AppProvider (مزود البيانات)
 * 2. اختيار الصفحة الصحيحة للعرض حسب currentPage
 *
 * هيكل المكوّنات:
 * ┌─────────────────────────────────────────┐
 * │  AppProvider (مزود البيانات العامة)     │
 * │  └── AppContent                         │
 * │       ├── HomePage        (home)         │
 * │       ├── QuizGroupPage   (quiz-group)   │
 * │       ├── QuizPage        (quiz)         │
 * │       ├── LeaderboardPage (leaderboard)  │
 * │       └── ProfilePage     (profile)      │
 * └─────────────────────────────────────────┘
 *
 * لماذا AppContent منفصل عن App؟
 * ─────────────────────────────────────────────
 * useApp() يجب استخدامه داخل AppProvider.
 * إذا كتبنا useApp() مباشرة في App() فسنحصل على خطأ
 * لأن AppProvider لم يُهيَّأ بعد عند تنفيذ App().
 * الحل: وضع منطق القراءة (useApp) في AppContent
 * ومنطق التهيئة (AppProvider) في App.
 * =====================================================
 */

import React from 'react';

/* استيراد مزود البيانات والـ Hook */
import { AppProvider, useApp } from './context/AppContext';

/* استيراد جميع الصفحات */
import HomePage        from './pages/HomePage';
import QuizGroupPage   from './pages/QuizGroupPage';
import QuizPage        from './pages/QuizPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage     from './pages/ProfilePage';


/*
 * AppContent - المكوّن الداخلي
 * يقرأ currentPage من Context ويعرض الصفحة المناسبة
 *
 * switch/case = بنية شرطية تُقارن قيمة currentPage
 * مع قيم ثابتة وتُعيد الصفحة المقابلة
 */
function AppContent() {

  /*
   * نجلب currentPage من Context
   * كلما تغيّرت قيمته يُعاد رسم (Re-render) هذا المكوّن
   * فيتغير المحتوى المعروض تلقائياً
   */
  const { currentPage } = useApp();

  /*
   * router بسيط مبني على switch/case
   * في المستقبل مع Next.js:
   * → كل صفحة ستكون ملف مستقل في مجلد /app
   * → مثل: /app/home/page.jsx, /app/quiz/page.jsx
   * → والتوجيه يكون بـ router.push('/home') بدلاً من navigateTo('home')
   */
  const renderPage = () => {
    switch (currentPage) {

      case 'home':
        /* الصفحة الرئيسية - الشاشة الأولى */
        return <HomePage />;

      case 'quiz-group':
        /* قائمة مراحل المستوى المحدد */
        return <QuizGroupPage />;

      case 'quiz':
        /* الاختبار الفعلي لمرحلة محددة */
        return <QuizPage />;

      case 'leaderboard':
        /* قائمة المتصدرين */
        return <LeaderboardPage />;

      case 'profile':
        /* الملف الشخصي والإحصائيات */
        return <ProfilePage />;

      default:
        /*
         * في حال وجود صفحة غير معروفة (لا يجب أن يحدث)
         * نعرض الصفحة الرئيسية كـ fallback
         */
        return <HomePage />;
    }
  };

  return renderPage();
}


/*
 * App - المكوّن الجذر النهائي
 * يُغلّف كل شيء بـ AppProvider
 *
 * هذا المكوّن هو ما يُصدَّر ويُستخدم في main.jsx
 */
function App() {
  return (
    /*
     * AppProvider يجب أن يحتضن جميع المكوّنات التي
     * تستخدم useApp() - أي الجميع تقريباً
     */
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
