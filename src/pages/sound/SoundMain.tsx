// src/pages/SoundMain.tsx

import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../api";
import { usePlayer } from "../../hooks/usePlayer";
import BottomNav from "../../components/layout/BottomNav";

interface Sound {
  soundId: number;
  title: string;
  thumbnailUrl: string;
  fileUrl: string;
  uploader: string;
  tags: string[];
}

interface Tag {
  tagId: number;
  name: string;
}

function SoundMain(): React.ReactElement {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [sortBy, setSortBy] = useState("latest");
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [keyword, setKeyword] = useState("");
  const [favorites, setFavorites] = useState<Sound[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const { playSoundWithPlaylist } = usePlayer();

  useEffect(() => {
    api.get<Tag[]>("/v1/tags")
      .then(res => setTags(res.data))
      .catch(err => console.log(err));
  }, []);

  // 즐겨찾기 목록 불러오기
  useEffect(() => {
    api.get<Sound[]>("/v1/favorites")
      .then(res => {
        setFavorites(res.data);
        setFavoriteIds(new Set(res.data.map(s => s.soundId)));
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    api.get<Sound[]>("/v1/sounds", {
      params: {
        sortBy,
        tagIds: selectedTags.length > 0 ? selectedTags.join(",") : undefined,
        keyword: keyword || undefined,
      },
    })
      .then(res => {
        setSounds(res.data);
      })
      .catch(err => console.log(err));
  }, [sortBy, selectedTags, keyword]);

  // 체크박스 토글 핸들러
  const handleTagChange = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)  // 이미 있으면 제거
        : [...prev, tagId]                  // 없으면 추가
    );
  };

  const handleSoundClick = (soundId: number) => {
    playSoundWithPlaylist(soundId, sounds);  // 전체 목록 전달
    navigate('/soundplayer');
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  // 즐겨찾기 토글
  const handleFavoriteToggle = async (e: React.MouseEvent, soundId: number) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    
    const isFav = favoriteIds.has(soundId);
    
    try {
      if (isFav) {
        // 즐겨찾기 해제
        await api.delete(`/v1/sounds/${soundId}/favorite`);
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(soundId);
          return newSet;
        });
        setFavorites(prev => prev.filter(s => s.soundId !== soundId));
      } else {
        // 즐겨찾기 추가
        await api.post(`/v1/sounds/${soundId}/favorite`);
        setFavoriteIds(prev => new Set(prev).add(soundId));
        // 추가된 sound를 favorites에 추가
        const sound = sounds.find(s => s.soundId === soundId);
        if (sound) {
          setFavorites(prev => [...prev, sound]);
        }
      }
    } catch (err) {
      console.error("즐겨찾기 토글 실패:", err);
    }
  };

  return (
    <>
      <h1>빗소리</h1>
      <div className="input-group">
        {/* 태그 체크박스 */}
        <div className="tag-filter">
          <label>
            <input
              type="checkbox"
              checked={selectedTags.length === 0}  // 아무것도 선택 안 되면 체크
              onChange={() => setSelectedTags([])}  // 클릭하면 전체 초기화
            />
            전체
          </label>
          {tags.map(tag => (
            <label key={tag.tagId}>
              <input
                type="checkbox"
                checked={selectedTags.includes(tag.tagId)}
                onChange={() => handleTagChange(tag.tagId)}
              />
              {tag.name}
            </label>
          ))}
        </div>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="form-control"
          placeholder="검색어 입력..."
        />
        <button type="submit" className="btn btn-outline-secondary">
          <i className="bi bi-search"></i>
          <span className="visually-hidden">검색</span>
        </button>
        <button className="btn btn-outline-danger">
          <i className="bi bi-arrow-clockwise"></i>
          <span className="visually-hidden">새로고침</span>
        </button>
      </div>
      <NavLink to="/sound/new">+</NavLink>
      <h3>목록</h3>
      <select name="sortBy" className="form-select" onChange={handleSortByChange}>
        <option value="latest">최신순</option>
        <option value="popularity">인기순</option>
      </select>
      <div className="sound-list">
        {sounds.map(sound => (
          <div className="sound-card" key={sound.soundId} onClick={() => handleSoundClick(sound.soundId)}>
            {sound.tags && sound.tags.length > 0 && (
              <span className="sound-tag">{sound.tags[0]}</span>
            )}
            <img src={sound.thumbnailUrl} alt={sound.title} />
            <h4>{sound.title}</h4>
            <p className="uploader-name">{sound.uploader}</p>
            <span 
              className={`favorite-star ${favoriteIds.has(sound.soundId) ? 'active' : ''}`}
              onClick={(e) => handleFavoriteToggle(e, sound.soundId)}
            >
              {favoriteIds.has(sound.soundId) ? '★' : '☆'}
            </span>
          </div>
        ))}
      </div>
      {/* 즐겨찾기 섹션 */}
      {favorites.length > 0 && (
        <>
          <h3>즐겨 찾기</h3>
          <div className="sound-list">
            {favorites.map(sound => (
              <div className="sound-card" key={sound.soundId} onClick={() => handleSoundClick(sound.soundId)}>
                {sound.tags && sound.tags.length > 0 && (
                  <span className="sound-tag">{sound.tags[0]}</span>
                )}
                <img src={sound.thumbnailUrl} alt={sound.title} />
                <h4>{sound.title}</h4>
                <p className="uploader-name">{sound.uploader}</p>
                <span 
                  className="favorite-star active"
                  onClick={(e) => handleFavoriteToggle(e, sound.soundId)}
                >
                  ★
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      <BottomNav />
    </>
  );
}

export default SoundMain;