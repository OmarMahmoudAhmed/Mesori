/*
 * =====================================================
 * Header.jsx - رأس الصفحة العلوي
 * =====================================================
 *
 * يتغير رأس الصفحة حسب الصفحة التي نحن فيها:
 *
 * الصفحة الرئيسية (Home):
 * ┌────────────────────────────────────┐
 * │  🔇  (صوت)          ⚙️  (إعدادات) │
 * └────────────────────────────────────┘
 *
 * باقي الصفحات (Quiz, Leaderboard, Profile):
 * ┌────────────────────────────────────┐
 * │  >   (رجوع)         ⚙️  (إعدادات) │
 * └────────────────────────────────────┘
 *
 * الخصائص (Props):
 * @prop showBack  {boolean} - هل نعرض زر الرجوع؟
 * @prop showSound {boolean} - هل نعرض زر الصوت؟
 * @prop onBack    {function} - دالة الرجوع (اختياري - إذا لم تُمرّر يستخدم goBack من Context)
 * =====================================================
 */

import React from 'react';
import { useApp } from '../../context/AppContext';

function Header({ showBack = false, showSound = false, onBack = null }) {

  const { isSoundOn, toggleSound, goBack } = useApp();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  return (
    <header
      dir="ltr"
      className="
        flex items-center justify-between
        px-4 py-3
        relative z-10
      "
    >
      {/* ===== الزر الأيسر (رجوع أو صوت) ===== */}
      {showBack ? (
        /* ---- زر الرجوع (سهم إلى اليمين →) ---- */
        <button
          onClick={handleBack}
          className="
            w-12 h-12
            bg-white
            rounded-2xl
            flex items-center justify-center
            shadow-card
            press-effect no-tap-highlight
            active:scale-95
            transition-transform duration-100
          "
          aria-label="رجوع للصفحة السابقة"
        >
          {/*
            * سهم الرجوع (متجه لليمين، مناسب لـ RTL)
            * 🖼️ صورة مطلوبة: /assets/icons/header/back-arrow.png (22×22px)
            */}
          <img src="/assets/icons/header/back-arrow.png" alt="رجوع" width={22} height={22} />
        </button>

      ) : showSound ? (
        /* ---- زر الصوت (🔊 / 🔇) ---- */
        <button
          onClick={toggleSound}
          className="
            w-12 h-12
            bg-white
            rounded-2xl
            flex items-center justify-center
            shadow-card
            press-effect no-tap-highlight
            transition-transform duration-100
          "
          aria-label={isSoundOn ? 'كتم الصوت' : 'تشغيل الصوت'}
        >
          {/*
            * أيقونة الصوت (تتغيّر حسب isSoundOn)
            * 🖼️ صور مطلوبة (22×22px لكل منهما):
            *   - /assets/icons/header/sound-on.png
            *   - /assets/icons/header/sound-off.png
            */}
          {isSoundOn ? (
            <img src="/assets/icons/header/sound-on.png" alt="كتم الصوت" width={22} height={22} />
          ) : (
            <img src="/assets/icons/header/sound-off.png" alt="تشغيل الصوت" width={22} height={22} />
          )}
        </button>

      ) : (
        <div className="w-12 h-12" />
      )}

      {/* ===== الزر الأيمن: الإعدادات (⚙️) ===== */}
      <button
        className="
          w-12 h-12
          bg-white
          rounded-2xl
          flex items-center justify-center
          shadow-card
          press-effect no-tap-highlight
          transition-transform duration-100
        "
        aria-label="الإعدادات"
        onClick={() => alert('⚙️ شاشة الإعدادات - ستُبنى قريباً!')}
      >
        {/*
          * أيقونة الإعدادات (الترس)
          * 🖼️ صورة مطلوبة: /assets/icons/header/settings.png (22×22px)
          */}
        <img src="/assets/icons/header/settings.png" alt="الإعدادات" width={22} height={22} />
      </button>
    </header>
  );
}

export default Header;