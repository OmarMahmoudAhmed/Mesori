/*
 * =====================================================
 * leaderboard.js - بيانات قائمة المتصدرين (Mock Data)
 * =====================================================
 *
 * القائمة تُرتَّب تنازلياً حسب النقاط (الأعلى أولاً)
 * المستخدم الحالي محدد بـ isCurrentUser: true
 *
 * عند الترحيل لـ Supabase:
 * هذا الاستعلام سيُولّد هذه القائمة:
 *
 * SELECT
 *   p.id, p.name, p.character,
 *   SUM(up.points) AS total_points,
 *   MAX(up.level_id) AS highest_level,
 *   RANK() OVER (ORDER BY SUM(up.points) DESC) AS rank
 * FROM profiles p
 * LEFT JOIN user_progress up ON p.id = up.user_id
 * GROUP BY p.id, p.name, p.character
 * ORDER BY total_points DESC
 * LIMIT 50;
 * =====================================================
 */

export const leaderboardData = [

  /* --- المراكز 1-3: تحصل على كؤوس (Trophies) ---
   * trophy: 'gold' | 'silver' | 'bronze' | null
   */

  {
    id:            1,
    rank:          1,             /* المركز في القائمة */
    name:          'مكتشف',      /* اسم اللاعب */
    levelReached:  5,             /* أعلى مستوى وصله */
    points:        320,           /* مجموع نقاطه الكلي */
    avatar:        'boy',         /* نوع الصورة الرمزية: 'boy' أو 'girl' */
    trophy:        'gold',        /* كوب ذهبي للمركز الأول */
    isCurrentUser: false,
  },
  {
    id:            2,
    rank:          2,
    name:          'رحالة صغير',
    levelReached:  4,
    points:        280,
    avatar:        'girl',
    trophy:        'silver',      /* كوب فضي للمركز الثاني */
    isCurrentUser: false,
  },
  {
    id:            3,
    rank:          3,
    name:          'هرم',
    levelReached:  4,
    points:        250,
    avatar:        'boy',
    trophy:        'bronze',      /* كوب برونزي للمركز الثالث */
    isCurrentUser: false,
  },

  /* --- المراكز 4-11: بدون كؤوس --- */

  {
    id: 4,  rank: 4,  name: 'نايل',    levelReached: 3, points: 210, avatar: 'boy',  trophy: null, isCurrentUser: false },
  {
    id: 5,  rank: 5,  name: 'فرعونة', levelReached: 3, points: 180, avatar: 'girl', trophy: null, isCurrentUser: false },
  {
    id: 6,  rank: 6,  name: 'أوزوريس',levelReached: 2, points: 150, avatar: 'boy',  trophy: null, isCurrentUser: false },
  {
    id: 7,  rank: 7,  name: 'إيزيس',  levelReached: 2, points: 140, avatar: 'girl', trophy: null, isCurrentUser: false },
  {
    id: 8,  rank: 8,  name: 'رع',     levelReached: 2, points: 130, avatar: 'boy',  trophy: null, isCurrentUser: false },
  {
    id: 9,  rank: 9,  name: 'أنوبيس', levelReached: 2, points: 120, avatar: 'boy',  trophy: null, isCurrentUser: false },
  {
    id: 10, rank: 10, name: 'نفرتيتي',levelReached: 1, points: 110, avatar: 'girl', trophy: null, isCurrentUser: false },
  {
    id: 11, rank: 11, name: 'حورس',   levelReached: 1, points: 105, avatar: 'boy',  trophy: null, isCurrentUser: false },

  /* --- المستخدم الحالي (يظهر بتمييز أخضر في أسفل القائمة) ---
   * isCurrentUser: true يُفعّل التمييز البصري الأخضر
   */
  {
    id:            12,
    rank:          12,
    name:          'أنت',          /* يُعرض كـ "أنت" ليعرف المستخدم نفسه */
    levelReached:  2,
    points:        100,
    avatar:        'boy',
    trophy:        null,
    isCurrentUser: true,           /* ← هذا العلم مهم جداً للتمييز البصري */
  },

];
