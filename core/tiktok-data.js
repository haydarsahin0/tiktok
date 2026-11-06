// TikTok olaylarını tek tip veriye çevirir. TikTok/aracı servis sürümleri arasında
// alan adları değişebiliyor (uniqueId/displayId, comment/content, gift/giftDetails...),
// hepsini deneriz. Hem tarayıcıda hem Node'da çalışır.

const first = (...vals) => vals.find((v) => v !== undefined && v !== null && v !== '');
const url0 = (img) => first(img?.urlList?.[0], img?.url_list?.[0], img?.url?.[0], img?.urls?.[0], typeof img === 'string' ? img : undefined);

export function readUser(raw) {
  const u = raw?.user || raw || {};
  const id = first(u.uniqueId, u.unique_id, u.displayId, u.display_id, u.userId, u.user_id, u.id);
  if (!id) return null;
  const avatar = first(u.profilePictureUrl, url0(u.avatarThumb), url0(u.avatar_thumb), url0(u.avatarMedium), url0(u.profilePicture), '') || '';
  return { id: String(id), name: String(first(u.nickname, u.nickName, id)), avatar };
}

export function readGift(data) {
  const g = data.gift || {};
  const ext = data.extendedGiftInfo || {};
  const d = data.giftDetails || data.gift_details || {};
  return {
    coins: Number(first(g.diamondCount, g.diamond_count, d.diamondCount, d.diamond_count, data.diamondCount, ext.diamond_count, 0)),
    count: Math.max(1, Number(first(data.repeatCount, data.repeat_count, 1))),
    name: String(first(g.name, d.giftName, d.name, ext.name, data.giftName, 'Hediye')),
    image: first(url0(g.image), d.giftImage?.giftPictureUrl, url0(d.giftImage), url0(ext.image), data.giftPictureUrl, '') || '',
    type: Number(first(g.type, d.giftType, d.type, data.giftType, 0)),
    repeatEnd: Boolean(first(data.repeatEnd, data.repeat_end, false)),
  };
}

export const readComment = (data) => String(first(data.comment, data.content, ''));
export const readLikeCount = (data) => Number(first(data.likeCount, data.count, 1));

// Takip mi paylaşım mı? (WebcastSocialMessage)
export function readSocialKind(data) {
  const label = `${data.displayType || ''} ${data.common?.displayText?.key || ''} ${data.label || ''}`.toLowerCase();
  if (label.includes('follow')) return 'follow';
  if (label.includes('share')) return 'share';
  const action = Number(data.action);
  if (action === 1) return 'follow';
  if (action === 3) return 'share';
  return null;
}

// Seri (combo) hediyeler: sadece seri bittiğinde sayılır
export const isStreakInProgress = (gift) => gift.type === 1 && !gift.repeatEnd;
