import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Upload, Plus, Trash2, Star, Eye, EyeOff, ArrowUp, ArrowDown, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

interface AdminWork {
  type: 'image' | 'video';
  url: string;
  raw?: string | null;
}

interface TutorDetail {
  id: string;
  email: string;
  accountName: string;
  accountStatus: string;
  hasProfile: boolean;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  tags: string[];
  works: AdminWork[];
  isPublished: boolean;
  isFeatured: boolean;
}

const INPUT = 'w-full border-2 border-[#101114] bg-white px-3 py-2 text-sm text-[#101114] outline-none transition-colors placeholder:text-[#8b8d85] focus:border-[#ff5a45]';
const FIELD_LABEL = 'mb-1 block text-xs font-bold text-[#54564f]';
const BTN_DARK = 'inline-flex items-center justify-center gap-2 border-2 border-[#101114] bg-[#101114] px-4 py-2 text-xs font-black text-white transition-colors hover:bg-[#ff5a45]';
const BTN_GHOST = 'inline-flex items-center justify-center gap-2 border-2 border-[#101114] bg-white px-4 py-2 text-xs font-black text-[#101114] transition-colors hover:bg-[#101114] hover:text-white';
const BTN_TINY = 'inline-flex items-center justify-center border-2 border-[#101114] bg-white p-1.5 text-[#101114] transition-colors hover:bg-[#101114] hover:text-white';

interface Props {
  userId: string | null;
  token: string | null;
  onClose: () => void;
  onSaved: () => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

export const TutorEditor: React.FC<Props> = ({ userId, token, onClose, onSaved, onNotify }) => {
  const [detail, setDetail] = useState<TutorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 表单字段
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [works, setWorks] = useState<AdminWork[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!userId) return;
    let active = true;
    setLoading(true);
    axios.get(`/api/admin/tutors/${userId}`, authHeader)
      .then(res => {
        if (!active) return;
        const d: TutorDetail = res.data;
        setDetail(d);
        setName(d.name || '');
        setTitle(d.title || '');
        setAvatar(d.avatar || '');
        setBio(d.bio || '');
        setTags(Array.isArray(d.tags) ? d.tags : []);
        setWorks(Array.isArray(d.works) ? d.works.map(w => ({ type: w.type === 'video' ? 'video' : 'image', url: w.url, raw: w.raw ?? null })) : []);
        setIsPublished(!!d.isPublished);
        setIsFeatured(!!d.isFeatured);
      })
      .catch((err) => {
        if (!active) return;
        onNotify(err.response?.data?.error || '导师资料加载失败', 'error');
        onClose();
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId]);

  const addTag = () => {
    const next = tagInput.trim();
    if (!next) return;
    setTags(current => (current.includes(next) ? current : [...current, next]));
    setTagInput('');
  };

  const uploadImage = async (file: File, target: 'avatar' | 'work') => {
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { Authorization: `Bearer ${token}`, 'content-type': 'multipart/form-data' }
      });
      if (target === 'avatar') setAvatar(res.data.url);
      else setWorks(current => [...current, { type: 'image', url: res.data.url }]);
      onNotify('图片已上传', 'success');
    } catch (err: any) {
      onNotify(err.response?.data?.error || '图片上传失败', 'error');
    } finally {
      setUploading(false);
    }
  };

  const addVideo = () => {
    const raw = videoUrl.trim();
    if (!raw) return;
    const bvidMatch = raw.match(/BV[0-9a-zA-Z]+/);
    const url = bvidMatch ? `//player.bilibili.com/player.html?bvid=${bvidMatch[0]}&page=1&high_quality=1` : raw;
    setWorks(current => [...current, { type: 'video', url, raw }]);
    setVideoUrl('');
  };

  const moveWork = (index: number, delta: number) => {
    setWorks(current => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    if (!userId) return;
    if (!name.trim()) { onNotify('请填写导师昵称', 'error'); return; }
    if (!title.trim()) { onNotify('请填写一句话头衔', 'error'); return; }
    setSaving(true);
    try {
      const res = await axios.put(`/api/admin/tutors/${userId}/profile`, {
        name: name.trim(),
        title: title.trim(),
        avatar: avatar.trim(),
        bio: bio.trim(),
        tags,
        works,
        isPublished,
        isFeatured
      }, authHeader);
      onNotify(res.data?.message || '导师资料已更新', 'success');
      onSaved();
      onClose();
    } catch (err: any) {
      onNotify(err.response?.data?.error || '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {userId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101114]/60 p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            onClick={event => event.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden border-2 border-[#101114] bg-white shadow-[10px_10px_0_#101114]"
          >
            <div className="flex items-center justify-between border-b-2 border-[#101114] bg-[#f7f4ec] px-5 py-4">
              <div className="min-w-0">
                <h3 className="text-lg font-black text-[#101114]">编辑导师资料</h3>
                <p className="mt-1 truncate text-xs font-bold text-[#777871]">
                  {detail ? `${detail.accountName} · ${detail.email}` : '加载中...'}
                  {detail && !detail.hasProfile && <span className="ml-2 border border-[#101114] bg-[#d9ff4f] px-1.5 py-0.5 text-[10px] text-[#101114]">尚无资料，保存后创建</span>}
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="关闭导师编辑" className="border-2 border-[#101114] bg-white p-1.5 transition-colors hover:bg-[#101114] hover:text-white"><X size={16} /></button>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin border-4 border-[#101114]/20 border-t-[#ff5a45]"></div>
              </div>
            ) : (
              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                {/* 头像 + 基础信息 */}
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="w-32 shrink-0">
                    <label className={FIELD_LABEL}>导师头像</label>
                    <div className="h-32 w-32 overflow-hidden border-2 border-[#101114] bg-[#f7f4ec]">
                      {avatar
                        ? <img src={avatar} alt="导师头像" className="h-full w-full object-cover" />
                        : <div className="grid h-full w-full place-items-center text-[#777871]"><ImageIcon size={28} /></div>}
                    </div>
                    <label className="mt-2 block cursor-pointer">
                      <span className={`${BTN_GHOST} w-full ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
                        <Upload size={13} /> {uploading ? '上传中...' : '上传头像'}
                      </span>
                      <input type="file" className="hidden" accept="image/*" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file, 'avatar');
                        e.target.value = '';
                      }} />
                    </label>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className={FIELD_LABEL}>导师头像地址（也可直接粘贴 URL）</label>
                      <input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="/uploads/xxx.png 或 https://..." className={INPUT} />
                    </div>
                    <div>
                      <label className={FIELD_LABEL}>导师昵称 *</label>
                      <input value={name} onChange={e => setName(e.target.value)} placeholder="展示在前台的昵称" className={INPUT} />
                    </div>
                    <div>
                      <label className={FIELD_LABEL}>一句话头衔 *</label>
                      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="例如 小说改编 / 剧本结构" className={INPUT} />
                    </div>
                  </div>
                </div>

                {/* 标签 */}
                <div>
                  <label className={FIELD_LABEL}>核心教学标签（回车添加）</label>
                  <div className="flex min-h-[46px] w-full flex-wrap items-center gap-2 border-2 border-[#101114] bg-white px-3 py-2 transition-colors focus-within:border-[#ff5a45]">
                    {tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 border-2 border-[#101114] bg-[#d9ff4f] px-2 py-0.5 text-xs font-black text-[#101114]">
                        {tag}
                        <button type="button" onClick={() => setTags(cur => cur.filter(t => t !== tag))} className="text-[#101114]/70 hover:text-[#ff5a45]" aria-label={`删除标签 ${tag}`}><X size={12} /></button>
                      </span>
                    ))}
                    <input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); addTag(); }
                      }}
                      className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-sm text-[#101114] outline-none placeholder:text-[#8b8d85]"
                      placeholder={tags.length ? '继续输入标签' : '例如：动态漫，按回车添加'}
                    />
                  </div>
                </div>

                {/* 简介 */}
                <div>
                  <label className={FIELD_LABEL}>个人简介</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="介绍该导师的教学方向与经验" className={`${INPUT} resize-none`} />
                </div>

                {/* 作品 */}
                <div>
                  <label className={FIELD_LABEL}>作品展示（顺序即前台展示顺序）</label>
                  <div className="space-y-2">
                    {works.length === 0 && <p className="border-2 border-dashed border-[#101114]/25 px-3 py-4 text-center text-xs font-bold text-[#777871]">暂无作品</p>}
                    {works.map((work, index) => (
                      <div key={`${work.url}-${index}`} className="flex items-center gap-3 border-2 border-[#101114] bg-[#f7f4ec] p-2">
                        {work.type === 'video'
                          ? <div className="grid h-14 w-14 shrink-0 place-items-center border-2 border-[#101114] bg-[#101114] text-[10px] font-black text-[#d9ff4f]">视频</div>
                          : <img src={work.url} alt="作品" className="h-14 w-14 shrink-0 border-2 border-[#101114] object-cover" />}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-bold text-[#54564f]">{work.raw || work.url}</div>
                          <div className="mt-0.5 text-[10px] font-black text-[#777871]">{work.type === 'video' ? '视频链接' : '图片'}</div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button type="button" onClick={() => moveWork(index, -1)} disabled={index === 0} className={`${BTN_TINY} disabled:opacity-30`} aria-label="上移"><ArrowUp size={13} /></button>
                          <button type="button" onClick={() => moveWork(index, 1)} disabled={index === works.length - 1} className={`${BTN_TINY} disabled:opacity-30`} aria-label="下移"><ArrowDown size={13} /></button>
                          <button type="button" onClick={() => setWorks(cur => cur.filter((_, i) => i !== index))} className={`${BTN_TINY} !text-[#ff5a45] hover:!bg-[#ff5a45] hover:!text-white`} aria-label="删除作品"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-col gap-2 md:flex-row">
                    <label className="flex-1 cursor-pointer">
                      <span className={`${BTN_GHOST} w-full ${uploading ? 'pointer-events-none opacity-60' : ''}`}><Upload size={13} /> 上传图片作品</span>
                      <input type="file" className="hidden" accept="image/*" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file, 'work');
                        e.target.value = '';
                      }} />
                    </label>
                    <div className="flex flex-1 gap-2">
                      <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="粘贴哔哩哔哩 / 抖音 / 腾讯视频链接" className={`${INPUT} min-w-0 flex-1`} />
                      <button type="button" onClick={addVideo} className={`${BTN_DARK} shrink-0`}><Plus size={13} /> 添加视频</button>
                    </div>
                  </div>
                </div>

                {/* 展示开关 */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setIsPublished(v => !v)}
                    className={`flex items-center gap-3 border-2 border-[#101114] px-3 py-2.5 text-left transition-colors ${isPublished ? 'bg-[#d9ff4f]' : 'bg-white'}`}
                  >
                    {isPublished ? <Eye size={15} /> : <EyeOff size={15} />}
                    <span className="text-xs font-black text-[#101114]">
                      {isPublished ? '已上架导师展示页' : '未上架（前台不展示）'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFeatured(v => !v)}
                    className={`flex items-center gap-3 border-2 border-[#101114] px-3 py-2.5 text-left transition-colors ${isFeatured ? 'bg-[#ff5a45] text-white' : 'bg-white text-[#101114]'}`}
                  >
                    <Star size={15} />
                    <span className="text-xs font-black">{isFeatured ? '首页精选导师' : '未设为首页精选'}</span>
                  </button>
                </div>

                <p className="border-2 border-[#101114]/20 bg-[#f7f4ec] px-3 py-2 text-[11px] font-bold leading-5 text-[#54564f]">
                  保存后立即生效并同步到前台展示页。若该导师有正在等待审核的资料，会被自动驳回，避免之后审核通过覆盖本次修改。
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 border-t-2 border-[#101114] bg-[#f7f4ec] px-5 py-4">
              <button type="button" onClick={onClose} className={BTN_GHOST}>取消</button>
              <button type="button" onClick={handleSave} disabled={saving || loading} className={`${BTN_DARK} disabled:cursor-not-allowed disabled:bg-[#aeb0a9]`}>
                <Save size={14} /> {saving ? '保存中...' : '保存导师资料'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
