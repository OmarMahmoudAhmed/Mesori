/*
 * =====================================================
 * ProfilePage.jsx - صفحة الملف الشخصي (معلوماتي)
 * =====================================================
 *
 * تعرض هذه الصفحة:
 * 1. اختيار الشخصية (ولد / بنت)
 * 2. البيانات الشخصية مع إمكانية التعديل
 * 3. إحصائيات اللاعب (النقاط، الترتيب، المراحل، المستوى)
 * =====================================================
 */

import React, { useState } from 'react';
import AppWrapper        from '../components/layout/AppWrapper';
import Header            from '../components/layout/Header';
import BottomNav         from '../components/layout/BottomNav';
import EgyptianLogo      from '../components/shared/EgyptianLogo.png';
import ExplorerCharacter from '../components/shared/ExplorerCharacter';
import { useApp }        from '../context/AppContext';

/* مكوّن صغير لحقل البيانات الشخصية مع زر التعديل */
function ProfileField({ icon, iconColor, label, value, onEdit }) {
  return (
    <div
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: '1px solid rgba(200,146,42,0.1)' }}
    >
      {/* زر القلم (تعديل) */}
      <button
        onClick={onEdit}
        className="
          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
          press-effect
        "
        style={{ backgroundColor: '#F4E2BC', border: '1px solid rgba(200,146,42,0.3)' }}
      >
        {/* أيقونة Flaticon Uicons (fi fi-rr-pencil) بدلاً من صورة PNG */}
        <i className="fi fi-rr-pencil" aria-hidden="true" style={{ fontSize: '14px', color: '#8B5A2B' }} />
      </button>

      {/* اسم الحقل — أيقونة Flaticon Uicons ملوّنة بدلاً من صورة PNG فارغة */}
      <div className="flex items-center gap-2 w-24 flex-shrink-0">
        <i className={`fi ${icon}`} aria-hidden="true" style={{ fontSize: '15px', color: iconColor }} />
        <span
          className="font-semibold text-sm"
          style={{ fontFamily: "'Cairo', sans-serif", color: '#8B4513' }}
        >
          {label}
        </span>
      </div>

      {/* القيمة */}
      <span
        className="flex-1 font-bold text-sm text-left"
        style={{ fontFamily: "'Cairo', sans-serif", color: '#3D2B1F' }}
      >
        {value}
      </span>
    </div>
  );
}

/* مكوّن صغير لبطاقة الإحصائية */
function StatCard({ icon, iconColor, value, label }) {
  return (
    <div
      className="flex flex-col items-center gap-1 p-3 rounded-2xl"
      style={{ backgroundColor: '#FDF3E3', border: '1px solid rgba(200,146,42,0.2)' }}
    >
      {/* أيقونة Flaticon Uicons (نمط solid) بألوان مميزة بدلاً من صورة PNG فارغة */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center mb-0.5"
        style={{ backgroundColor: `${iconColor}1A` /* خلفية شفافة بلون الأيقونة نفسه */ }}
      >
        <i
          className={`fi ${icon}`}
          aria-hidden="true"
          style={{ fontSize: '18px', color: iconColor, filter: `drop-shadow(0 1px 2px ${iconColor}4D)` }}
        />
      </div>
      <span
        className="font-black text-xl"
        style={{ fontFamily: "'Cairo', sans-serif", color: '#3D2B1F' }}
      >
        {value}
      </span>
      <span
        className="text-center leading-tight"
        style={{ fontFamily: "'Cairo', sans-serif", fontSize: '11px', color: '#8B5A2B' }}
      >
        {label}
      </span>
    </div>
  );
}


function ProfilePage() {

  const { userProfile, updateUserProfile, goBack } = useApp();

  /*
   * editingField - اسم الحقل الذي يجري تعديله حالياً
   * null = لا يوجد تعديل حالي
   * 'name' | 'age' | 'country' | 'email' = حقل قيد التعديل
   */
  const [editingField, setEditingField] = useState(null);

  /* قيمة مؤقتة للحقل أثناء التعديل */
  const [tempValue, setTempValue] = useState('');

  /* بدء تعديل حقل معين */
  const startEditing = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  /* حفظ التعديل */
  const saveEdit = () => {
    if (tempValue.trim()) {
      updateUserProfile({ [editingField]: tempValue.trim() });
    }
    setEditingField(null);
  };

  return (
    <AppWrapper>
      <Header showBack={true} onBack={goBack} />

      <main
        className="flex-1 overflow-y-auto app-scroll"
        style={{ paddingBottom: '96px' }}
      >

        {/* قسم الرأس */}
        <div className="flex items-end justify-between px-4 pt-2 mb-2">
          <img
            src={EgyptianLogo}
            alt="شعار ميسوري"
            width={110}
            height={110}
            className="drop-shadow-lg"
          />

          <div className="flex-1 flex flex-col items-center pb-2">
            {/* النجوم الزخرفية */}
            <div className="flex gap-1 mb-1">
              {['✦', '✦', '✦'].map((s, i) => (
                <span key={i} style={{ color: '#C8922A', fontSize: '12px' }}>{s}</span>
              ))}
            </div>

            <h1
              className="font-black text-2xl"
              style={{ fontFamily: "'Cairo', sans-serif", color: '#3D2B1F' }}
            >
              معلوماتي
            </h1>
            <p
              className="text-center text-xs mt-1"
              style={{ fontFamily: "'Cairo', sans-serif", color: '#8B4513' }}
            >
              إدارة حسابك ومعلوماتك الشخصية
            </p>
          </div>

          <ExplorerCharacter size={80} gender={userProfile.character} />
        </div>


        {/* ===== اختيار الشخصية ===== */}
        <div
          className="mx-4 mb-4 rounded-2xl p-4"
          style={{ backgroundColor: 'white', border: '1px solid rgba(200,146,42,0.2)' }}
        >
          {/* العنوان */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2
                className="font-bold text-base"
                style={{ fontFamily: "'Cairo', sans-serif", color: '#3D2B1F' }}
              >
                الشخصية
              </h2>
              <p
                className="text-xs"
                style={{ fontFamily: "'Cairo', sans-serif", color: '#8B5A2B' }}
              >
                اختر الشخصية التي تمثلك في رحلتك
              </p>
            </div>
            {/* أيقونة Flaticon Uicons (fi fi-rr-users) بدلاً من صورة PNG فارغة */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(45,106,63,0.1)' }}
            >
              <i className="fi fi-rr-users" aria-hidden="true" style={{ fontSize: '17px', color: '#2D6A3F' }} />
            </div>
          </div>

          {/* خيارات الشخصية */}
          <div className="flex gap-6 justify-center">
            {[
              { key: 'boy',  label: 'ولد'  },
              { key: 'girl', label: 'بنت'  },
            ].map(({ key, label }) => {

              const isSelected = userProfile.character === key;

              return (
                <button
                  key={key}
                  onClick={() => updateUserProfile({ character: key })}
                  className="flex flex-col items-center gap-2 press-effect"
                >
                  {/* دائرة الشخصية مع علامة الاختيار */}
                  <div className="relative">
                    <div
                      className="rounded-full p-1"
                      style={{
                        border: `3px solid ${isSelected ? '#2D6A3F' : 'rgba(200,146,42,0.3)'}`,
                        backgroundColor: isSelected ? 'rgba(45,106,63,0.05)' : 'transparent',
                      }}
                    >
                      <ExplorerCharacter size={60} gender={key} />
                    </div>

                    {/* علامة الاختيار — أيقونة Flaticon Uicons (fi fi-rr-check) بدلاً من صورة PNG */}
                    {isSelected && (
                      <div
                        className="absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#2D6A3F' }}
                      >
                        <i className="fi fi-rr-check" aria-hidden="true" style={{ fontSize: '12px', color: '#FFFFFF' }} />
                      </div>
                    )}
                  </div>

                  {/* اسم الشخصية */}
                  <div
                    className="px-5 py-1.5 rounded-full"
                    style={{
                      backgroundColor: isSelected ? '#2D6A3F' : 'rgba(200,146,42,0.15)',
                    }}
                  >
                    <span
                      className="font-bold text-sm"
                      style={{
                        fontFamily: "'Cairo', sans-serif",
                        color: isSelected ? 'white' : '#8B4513',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>


        {/* ===== البيانات الشخصية ===== */}
        <div
          className="mx-4 mb-4 rounded-2xl p-4"
          style={{ backgroundColor: 'white', border: '1px solid rgba(200,146,42,0.2)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <h2
              className="font-bold text-base"
              style={{ fontFamily: "'Cairo', sans-serif", color: '#3D2B1F' }}
            >
              البيانات الشخصية
            </h2>
            {/* أيقونة Flaticon Uicons (fi fi-rr-id-badge) بدلاً من صورة PNG فارغة */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(200,146,42,0.12)' }}
            >
              <i className="fi fi-rr-id-badge" aria-hidden="true" style={{ fontSize: '15px', color: '#C8922A' }} />
            </div>
          </div>

          {/* حقول البيانات — أيقونات Flaticon Uicons ملوّنة بدلاً من صور PNG فارغة */}
          <ProfileField
            icon="fi-rr-user" iconColor="#C8922A" label="الاسم"
            value={userProfile.name}
            onEdit={() => startEditing('name', userProfile.name)}
          />
          <ProfileField
            icon="fi-rr-cake-birthday" iconColor="#C8922A" label="العمر"
            value={`${userProfile.age} سنوات`}
            onEdit={() => startEditing('age', String(userProfile.age))}
          />
          <ProfileField
            icon="fi-rr-flag" iconColor="#C8922A" label="الدولة"
            value={`${userProfile.countryFlag} ${userProfile.country}`}
            onEdit={() => startEditing('country', userProfile.country)}
          />
          <div style={{ borderBottom: 'none' }}>
            <ProfileField
              icon="fi-rr-envelope" iconColor="#C8922A" label="البريد"
              value={userProfile.email}
              onEdit={() => startEditing('email', userProfile.email)}
            />
          </div>
        </div>


        {/* ===== إحصائياتي ===== */}
        <div
          className="mx-4 mb-4 rounded-2xl p-4"
          style={{ backgroundColor: 'white', border: '1px solid rgba(200,146,42,0.2)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="font-bold text-base"
              style={{ fontFamily: "'Cairo', sans-serif", color: '#3D2B1F' }}
            >
              إحصائياتي
            </h2>
            {/* أيقونة Flaticon Uicons (fi fi-rr-chart-histogram) بدلاً من صورة PNG فارغة */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(200,146,42,0.12)' }}
            >
              <i className="fi fi-rr-chart-histogram" aria-hidden="true" style={{ fontSize: '14px', color: '#C8922A' }} />
            </div>
          </div>

          {/* بطاقات الإحصائيات — أيقونات Flaticon Uicons (نمط solid) ملوّنة بدلاً من صور PNG فارغة */}
          <div className="grid grid-cols-4 gap-2">
            <StatCard icon="fi-sr-star"          iconColor="#C8922A" value={userProfile.totalPoints}     label="إجمالي النقاط"    />
            <StatCard icon="fi-sr-crown"         iconColor="#B8860B" value={userProfile.rank}            label="الترتيب الحالي"   />
            <StatCard icon="fi-sr-flag-checkered" iconColor="#2D6A3F" value={userProfile.completedStages} label="المراحل المكتملة" />
            <StatCard icon="fi-sr-level-up"      iconColor="#1A7F8E" value={userProfile.currentLevel}    label="المستوى الحالي"  />
          </div>
        </div>

      </main>


      {/* نافذة تعديل الحقل */}
      {editingField && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', maxWidth: '448px', left: '50%', transform: 'translateX(-50%)' }}
          onClick={() => setEditingField(null)}
        >
          <div
            className="w-full rounded-t-3xl p-6"
            style={{ backgroundColor: 'white' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg mb-4 text-center"
                style={{ fontFamily: "'Cairo', sans-serif", color: '#3D2B1F' }}>
              تعديل {editingField === 'name' ? 'الاسم'
                    : editingField === 'age' ? 'العمر'
                    : editingField === 'country' ? 'الدولة'
                    : 'البريد الإلكتروني'}
            </h3>

            <input
              type={editingField === 'age' ? 'number' : editingField === 'email' ? 'email' : 'text'}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-right outline-none font-semibold"
              style={{
                fontFamily: "'Cairo', sans-serif",
                border: '2px solid #C8922A',
                backgroundColor: '#FDF3E3',
                color: '#3D2B1F',
                fontSize: '16px',
              }}
              autoFocus
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setEditingField(null)}
                className="flex-1 py-3 rounded-xl font-bold"
                style={{ fontFamily: "'Cairo', sans-serif", backgroundColor: '#F3F4F6', color: '#6B7280' }}
              >
                إلغاء
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 py-3 rounded-xl font-bold text-white"
                style={{ fontFamily: "'Cairo', sans-serif", backgroundColor: '#2D6A3F' }}
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}


      <BottomNav activePage="profile" />
    </AppWrapper>
  );
}

export default ProfilePage;
