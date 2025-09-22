// src/components/freelance/FreelanceContacts.tsx
'use client';

import { useState, useEffect } from 'react';
import { getResponseStatus, ResponseStatus } from '@/utils/responseTime';

export default function FreelanceContacts() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [responseStatus, setResponseStatus] = useState<ResponseStatus>({
    timeText: 'Отвечаю за 5-7 мин',
    status: 'fast'
  });

  useEffect(() => {
    const updateStatus = () => {
      setResponseStatus(getResponseStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика отправки формы
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contacts = [
    {
      icon: 'fas fa-phone',
      title: 'Телефон',
      value: '+7 (958) 231-73-64',
      link: 'tel:+79582317364'
    },
    {
      icon: 'fab fa-telegram',
      title: 'Telegram',
      value: '@G0SL0T0',
      link: 'https://t.me/G0SL0T0'
    },
    {
      icon: 'fab fa-github',
      title: 'GitHub',
      value: 'github.com/Gosioto',
      link: 'https://github.com/Gosioto'
    },
    {
      icon: 'fab fa-github',
      title: 'Старый GitHub',
      value: 'G0SL0T0 (заблокирован)',
      link: '#',
      disabled: true
    }
  ];

  return (
    <section className="freelance-contacts" id="contacts">
      <div className="freelance-contacts-content">
        
        <div className="section-header">
          <h2 className="section-title">Связаться со мной</h2>
          <p className="section-subtitle">Готов обсудить ваш проект</p>
        </div>

        <div className="contacts-container">
          
          {/* Contact Info */}
          <div className="contact-info">
            <h3 className="contact-info-title">Контактная информация</h3>
            
            <div className="contact-list">
              {contacts.map((contact, index) => (
                <a 
                  key={index} 
                  href={contact.link} 
                  className={`contact-item ${contact.disabled ? 'disabled' : ''}`}
                  onClick={contact.disabled ? (e) => e.preventDefault() : undefined}
                >
                  <div className="contact-icon">
                    <i className={contact.icon}></i>
                  </div>
                  <div className="contact-details">
                    <span className="contact-title">{contact.title}</span>
                    <span className="contact-value">{contact.value}</span>
                  </div>
                </a>
              ))}
            </div>

            <div className="contact-availability">
              <div className="availability-status">
                <span className={`status-dot ${responseStatus.status === 'fast' ? 'available' : responseStatus.status === 'slow' ? 'slow' : 'unavailable'}`}></span>
                <span className="status-text">Доступен для новых проектов</span>
              </div>
              <p className={`availability-note ${responseStatus.status}`}>
                {responseStatus.timeTextHighlight ? (
                  <>
                    {responseStatus.timeText.replace(responseStatus.timeTextHighlight, '')}
                    <span className="time-highlight">{responseStatus.timeTextHighlight}</span>
                  </>
                ) : (
                  responseStatus.timeText
                )}
              </p>
              {responseStatus.timeUntilChange && (
                <p className="time-until-change">
                  {responseStatus.changeDescription}: {responseStatus.timeUntilChange}
                </p>
              )}
              {responseStatus.warning && (
                <p className="availability-warning">
                  {responseStatus.warning}
                </p>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
