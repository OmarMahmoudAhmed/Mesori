/*
 * =====================================================
 * BottomNav.jsx - شريط التنقل السفلي
 * =====================================================
 *
 * يحتوي على 3 أزرار تنقل رئيسية:
 * ┌──────────────────────────────────────────────────┐
 * │  [ℹ️ معلومات]   [🏠 الرئيسية]   [🏆 المتصدرين] │
 * │     INFO            Home          LEADERBOARD    │
 * └──────────────────────────────────────────────────┘
 *
 * الزر النشط (activePage) يحصل على:
 * - حدود ملونة حول الدائرة
 * - لون مختلف للأيقونة
 *
 * position: fixed = الشريط ثابت في أسفل الشاشة دائماً
 * width: min(100%, 448px) = لا يتجاوز عرض التطبيق
 * left: 50%; transform: translateX(-50%) = توسيط الشريط
 *
 * الخصائص (Props):
 * @prop activePage {string} - اسم الصفحة الحالية للتمييز البصري
 * =====================================================
 */

import React from 'react';
import { useApp } from '../../context/AppContext';

function BottomNav({ activePage = 'home' }) {

  /*
   * نجلب navigateTo من Context لتغيير الصفحة
   * عند الضغط على أي زر تنقل
   */
  const { navigateTo } = useApp();

  /*
   * أزرار التنقل - كل زر يحتوي على:
   * - id:        مُعرّف للمقارنة مع activePage
   * - page:      اسم الصفحة في نظام التنقل
   * - labelEn:   التسمية بالإنجليزية
   * - labelAr:   التسمية بالعربية
   * - iconColor: لون الدائرة الخلفية
   * - icon:      مكوّن SVG للأيقونة
   */
  const navItems = [

    /* ---- زر الإعدادات/المعلومات (أقصى اليسار في RTL = يسار بصري) ---- */
    {
      id:       'profile',
      page:     'profile',
      labelEn:  'INFO',
      labelAr:  'معلوماتي',
      /* دائرة فيروزية (تبقى مُتحكَّم بها بالكود لتغيير اللون بين active/inactive) */
      iconBgActive:   '#1A7F8E',
      iconBgInactive: '#2A6070',
      /*
       * أيقونة Flaticon Uicons (fi fi-rr-info) بدلاً من صورة PNG
       * اللون أبيض لأنها توضع فوق دائرة ملونة
       */
      iconClass: 'fi fi-rr-info',
    },

    /* ---- زر الصفحة الرئيسية (في المنتصف) ---- */
    {
      id:       'home',
      page:     'home',
      labelEn:  'Home',
      labelAr:  'الرئيسية',
      /* دائرة بنية دافئة */
      iconBgActive:   '#8B5A2B',
      iconBgInactive: '#6B4020',
      /*
       * أيقونة Flaticon Uicons (fi fi-rr-home) بدلاً من صورة PNG
       */
      iconClass: 'fi fi-rr-home',
    },

    /* ---- زر قائمة المتصدرين (أقصى اليمين في RTL = يمين بصري) ---- */
    {
      id:       'leaderboard',
      page:     'leaderboard',
      labelEn:  'LEADERBOARD',
      labelAr:  'المتصدرين',
      /* دائرة ذهبية */
      iconBgActive:   '#C8922A',
      iconBgInactive: '#9A6A1A',
      /*
       * أيقونة Flaticon Uicons (fi fi-rr-leaderboard) بدلاً من صورة PNG
       */
      iconClass: 'fi fi-rr-leaderboard',
    },

  ];

  return (
    /*
     * الشريط ثابت في الأسفل (position: fixed)
     * width: min(100%, 448px) = لا يتجاوز عرض حاوية التطبيق
     * left + transform = يوسّطه أفقياً على الشاشة
     * z-50 = يظهر فوق كل المحتوى الآخر
     */
    <nav
      dir="ltr" /* نستخدم LTR ليكون ترتيب الأزرار: INFO | Home | Leaderboard من اليسار */
      className="fixed bottom-0 z-50"
      style={{
        width:     'min(100%, 448px)', /* أقصى عرض = عرض max-w-md */
        left:      '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#1A0F02',   /* بني داكن جداً تقريباً أسود */
      }}
    >
      <div className="flex items-center justify-around px-4 py-3 pb-safe">

        {/* رسم كل زر تنقل */}
        {navItems.map((item) => {

          /*
           * isActive = صحيح إذا كانت هذه الصفحة هي الحالية
           * يُغيّر المظهر البصري للزر النشط
           */
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.page)}
              className="
                flex flex-col items-center gap-1
                press-effect no-tap-highlight
                min-w-[60px]
              "
              aria-label={item.labelAr}
              aria-current={isActive ? 'page' : undefined}
            >

              {/*
                * الدائرة التي تحتوي على الأيقونة
                * عند النشاط: حدود ملونة (ring) + لون أفتح
                */}
              <div
                className={`
                  w-12 h-12
                  rounded-full
                  flex items-center justify-center
                  transition-all duration-200
                  ${isActive
                    ? 'ring-2 ring-white ring-opacity-40 scale-110'
                    : 'opacity-75'
                  }
                `}
                style={{
                  backgroundColor: isActive ? item.iconBgActive : item.iconBgInactive,
                }}
              >
                {/*
                  * عرض أيقونة Flaticon Uicons للعنصر
                  * opacity تتغيّر حسب حالة النشاط (نفس منطق السابق)
                  */}
                <i
                  className={item.iconClass}
                  aria-hidden="true"
                  style={{
                    fontSize: '22px',
                    color:    '#FFFFFF',
                    opacity:  isActive ? 1 : 0.8,
                  }}
                />
              </div>

              {/* التسمية بالإنجليزية */}
              <span
                className="text-xs font-bold tracking-wide"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  color:      isActive ? '#FFFFFF' : '#9CA3AF',
                  fontSize:   '9px',
                  letterSpacing: '0.5px',
                }}
              >
                {item.labelEn}
              </span>

              {/* التسمية بالعربية */}
              <span
                className="text-xs font-semibold"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  color:      isActive ? '#D4A040' : '#6B7280',
                  fontSize:   '10px',
                }}
              >
                {item.labelAr}
              </span>

            </button>
          );
        })}

      </div>
    </nav>
  );
}

export default BottomNav;
