import { useState } from 'react';

// Use the same API URL logic as the rest of the app
const API_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? "/api" : "http://127.0.0.1:3000/api");

export const ProfilePhoto = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
        <div
            className="profile-photo-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: 'relative',
                width: '32px',
                height: '32px',
                flexShrink: 0,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `2px solid var(--terminal-highlight)`,
                    cursor: 'pointer',
                    backgroundColor: imageError ? 'var(--terminal-highlight)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    boxShadow: isHovered ? '0 8px 16px rgba(0, 0, 0, 0.4)' : 'none',
                    transform: isHovered
                        ? 'translate(-50%, -50%) scale(2)'
                        : 'translate(-50%, -50%) scale(1)',
                    transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease',
                }}
            >
                {!imageError ? (
                    <img
                        src={`${API_URL}/profile-photo`}
                        alt="Profile"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <span style={{
                        color: 'var(--background)',
                        fontWeight: 'bold',
                        fontSize: isHovered ? '20px' : '12px',
                        transition: 'font-size 0.25s ease',
                    }}>
                        RB
                    </span>
                )}
            </div>
        </div>
    );
};
