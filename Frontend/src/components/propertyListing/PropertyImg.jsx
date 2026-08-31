import React, { useState } from 'react';
import Modal from "./Modal";
import { Images } from 'lucide-react';

const fallbackImg = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80';

const PropertyImg = ({ images = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShowAllPhotos = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const imgList = Array.isArray(images) && images.length > 0 ? images : [{ url: fallbackImg }];

  const getImgUrl = (idx) => {
    if (imgList[idx] && imgList[idx].url) return imgList[idx].url;
    return imgList[0]?.url || fallbackImg;
  };

  return (
    <>
      <div className="property-gallery-bento">
        <div className="bento-main">
          <img
            src={getImgUrl(0)}
            alt="Property Main"
            onClick={handleShowAllPhotos}
            onError={(e) => { e.target.src = fallbackImg; }}
          />
        </div>

        <div className="bento-secondary">
          <img
            src={getImgUrl(1)}
            alt="Property 2"
            onClick={handleShowAllPhotos}
            onError={(e) => { e.target.src = fallbackImg; }}
          />
        </div>

        <div className="bento-secondary">
          <img
            src={getImgUrl(2)}
            alt="Property 3"
            onClick={handleShowAllPhotos}
            onError={(e) => { e.target.src = fallbackImg; }}
          />
        </div>

        <div className="bento-secondary">
          <img
            src={getImgUrl(3)}
            alt="Property 4"
            onClick={handleShowAllPhotos}
            onError={(e) => { e.target.src = fallbackImg; }}
          />
        </div>

        <div className="bento-secondary bento-last">
          <img
            src={getImgUrl(4)}
            alt="Property 5"
            onClick={handleShowAllPhotos}
            onError={(e) => { e.target.src = fallbackImg; }}
          />
          <button className="show-photos-btn" onClick={handleShowAllPhotos}>
            <Images size={16} /> Show all {imgList.length} photos
          </button>
        </div>
      </div>

      {isModalOpen && <Modal images={imgList} onClose={handleCloseModal} />}
    </>
  );
};

export default PropertyImg;