/*
 * =====================================================
 * LevelCard.jsx - بطاقة المستوى الواحد
 * =====================================================
 *
 * تعرض هذه البطاقة معلومات مستوى واحد:
 *
 * ┌─────────────────────┐
 * │  Level X       🔒  │  ← headerBg (أغمق) + أيقونة قفل (إن وُجدت)
 * ├─────────────────────┤
 * │       [صورة]        │
 * │      سهل            │  ← bgColor الرئيسي
 * ├─────────────────────┤
 * │ (●) 10 اختبارات     │  ← badgeBg (أغمق) + دوائر ملونة للأيقونات
 * │ (●) 100 نقطة ممكنة │
 * └─────────────────────┘
 *
 * ⚠️ ملاحظة مهمة عن الصور:
 * كل الأيقونات هنا عبارة عن عناصر <img> فارغة تشير لمسارات
 * صور PNG لم تُضَف بعد. راجع README.md قسم "الصور المطلوبة"
 * لمعرفة المسار المطلوب والمقاس لكل صورة.
 *
 * الخصائص (Props):
 * @prop level  {object} - بيانات المستوى من levels.js
 * =====================================================
 */

import React from 'react';
import { useApp } from '../../context/AppContext';

function LevelCard({ level }) {

  /*
   * نجلب navigateTo للانتقال لصفحة اختيار المرحلة
   * عند الضغط على البطاقة
   */
  const { navigateTo } = useApp();

  /*
   * handlePress - دالة الضغط على بطاقة المستوى
   *
   * المنطق:
   * إذا المستوى مفتوح (isUnlocked) → انتقل لصفحة مراحل المستوى
   * إذا المستوى مقفول              → أظهر رسالة تشجيعية
   */
  const handlePress = () => {
    if (level.isUnlocked) {
      navigateTo('quiz-group', { levelId: level.id });
    } else {
      alert(`🔒 المستوى ${level.nameAr} مقفول حالياً!\nأكمل المستوى السابق لفتحه.`);
    }
  };

  return (
    <div
      onClick={handlePress}
      className="
        rounded-2xl overflow-hidden
        cursor-pointer
        press-effect no-tap-highlight
        shadow-card
        transition-all duration-200
        active:scale-95
      "
      style={{ backgroundColor: level.bgColor }}
    >

      {/* ===== رأس البطاقة: "Level X" + أيقونة القفل ===== */}
      <div
        className="px-3 py-2.5 flex items-center justify-between"
        style={{ backgroundColor: level.headerBg }}
      >
        <span
          className="font-bold text-white tracking-wide"
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize:   '13px',
          }}
        >
          {level.nameEn}
        </span>

        {/*
          * أيقونة القفل — تظهر فقط إذا كان المستوى مقفولاً
          * 🖼️ صورة مطلوبة: /assets/icons/badges/lock.png (14×14px تقريباً)
          */}
        {!level.isUnlocked && (
          <img
            src="/assets/icons/badges/lock.png"
            alt="مقفول"
            width={14}
            height={14}
            className="opacity-80"
          />
        )}
      </div>

      {/* ===== منتصف البطاقة: أيقونة المستوى واسم الصعوبة ===== */}
      <div className="flex flex-col items-center justify-center px-3 py-3 gap-1.5">

        {/*
          * أيقونة المستوى الرئيسية (هرم / قناع فرعون / عمود ...)
          * 🖼️ صورة مطلوبة: level.iconSrc (معرّفة في data/levels.js)
          * المقاس المقترح: 36×36px
          */}
        <img
          src={level.iconSrc}
          alt={level.nameAr}
          width={36}
          height={36}
          style={{ objectFit: 'contain' }}
        />

        {/* اسم الصعوبة بالعربية */}
        <span
          className="font-black text-center"
          style={{
            fontFamily: "'Cairo', sans-serif",
            fontSize:   '15px',
            color:      level.textColor,
          }}
        >
          {level.nameAr}
        </span>
      </div>

      {/* ===== أسفل البطاقة: الإحصائيات ===== */}
      <div
        className="px-3 py-2 space-y-1.5"
        style={{ backgroundColor: level.badgeBg }}
      >

        {/* إحصائية: عدد الاختبارات */}
        <div className="flex items-center gap-1.5">
          {/*
            * دائرة ملونة (بلون المستوى) تحتوي أيقونة بيضاء
            * 🖼️ صورة مطلوبة: /assets/icons/badges/quiz-count.png (أيقونة شخص، بيضاء اللون، ~11×11px)
            * لماذا دائرة code-controlled وليست صورة كاملة؟
            * حتى يبقى لون الدائرة مرتبطاً بلون كل مستوى (badgeText) تلقائياً
            */}
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: level.badgeText }}
          >
            <img src="/assets/icons/badges/quiz-count.png" alt="" width={11} height={11} />
          </div>
          <span
            className="font-semibold"
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontSize:   '11px',
              color:      level.badgeText,
            }}
          >
            {level.quizCount} اختبارات
          </span>
        </div>

        {/* إحصائية: النقاط الممكنة */}
        <div className="flex items-center gap-1.5">
          {/*
            * 🖼️ صورة مطلوبة: /assets/icons/badges/points-star.png (أيقونة نجمة، بيضاء اللون، ~11×11px)
            */}
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: level.badgeText }}
          >
            <img src="/assets/icons/badges/points-star.png" alt="" width={11} height={11} />
          </div>
          <span
            className="font-semibold"
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontSize:   '11px',
              color:      level.badgeText,
            }}
          >
            {level.maxPoints} نقطة ممكنة
          </span>
        </div>

      </div>

    </div>
  );
}

export default LevelCard;
