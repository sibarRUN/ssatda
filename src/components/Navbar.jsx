// Navbar.jsx
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { useLocomotiveScroll } from 'react-locomotive-scroll';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// Styled-components for styling the Navbar and its elements
const NavContainer = styled(motion.div)`
  position: absolute;
  top: ${(props) => (props.click ? '0' : `-${props.theme.navHeight}`)};
  transition: all 0.3s ease;
  z-index: 6;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 40em) {
    top: ${(props) => (props.click ? '0' : `calc(-50vh - 4rem)`)};
  }
`;

const MenuBtn = styled.li`
  background-color: ${(props) => `rgba(${props.theme.textRgba},0.7)`};
  color: ${(props) => props.theme.body};
  width: 15rem;
  height: 2.5rem;
  border: none;
  outline: none;
  clip-path: polygon(0 0, 100% 0, 80% 100%, 20% 100%);
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  font-size: ${(props) => props.theme.fontmd};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;

  @media (max-width: 40em) {
    width: 10rem;
    height: 2rem;
  }
`;

const MenuItems = styled(motion.ul)`
  position: relative;
  height: ${(props) => props.theme.navHeight};
  background-color: ${(props) => props.theme.body};
  color: ${(props) => props.theme.text};
  display: flex;
  justify-content: space-around;
  align-items: center;
  list-style: none;
  width: 100%;
  padding: 0 10rem;

  @media (max-width: 40em) {
    flex-direction: column;
    padding: 2rem 0;
    height: 50vh;
  }
`;

const Item = styled(motion.li)`
  text-transform: uppercase;
  color: ${(props) => props.theme.text};

  @media (max-width: 40em) {
    padding: 0.5rem 0;
  }
`;

// Cognito Config
const COGNITO_DOMAIN = 'https://ap-northeast-2ivdyin7gr.auth.ap-northeast-2.amazoncognito.com';
const REDIRECT_URI = 'https://d3ar16mky2i6te.cloudfront.net';
const CLIENT_ID = '6tnct5lftekfjnvoq4fa8810pj';

const Navbar = () => {
  const [click, setClick] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { scroll } = useLocomotiveScroll();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    console.log("URL 파라미터 확인 - 인증 코드:", code ? '존재' : '없음');

    if (code) {
      exchangeCodeForToken(code);
    } else {
      // Check localStorage for tokens
      const accessToken = localStorage.getItem('accessToken');
      console.log("localStorage 토큰 확인:", accessToken ? '존재' : '없음');
      if (accessToken) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const exchangeCodeForToken = async (code) => {
    console.log("토큰 교환 시작, 코드:", code);
    const tokenEndpoint = `${COGNITO_DOMAIN}/oauth2/token`;

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('client_id', CLIENT_ID);

    console.log("요청 URL:", tokenEndpoint);
    console.log("요청 파라미터:", params.toString());

    try {
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });

      console.log("응답 상태:", response.status);

      if (response.ok) {
        const tokens = await response.json();
        console.log("토큰 수신 성공");
        console.log("토큰 정보:", {
          accessToken: tokens.access_token ? '존재' : '없음',
          idToken: tokens.id_token ? '존재' : '없음',
          refreshToken: tokens.refresh_token ? '존재' : '없음'
        });

        // Store tokens in localStorage
        if (tokens.access_token) localStorage.setItem('accessToken', tokens.access_token);
        if (tokens.id_token) localStorage.setItem('idToken', tokens.id_token);
        if (tokens.refresh_token) localStorage.setItem('refreshToken', tokens.refresh_token);
        
        setIsAuthenticated(true);

        // URL 정리 (code 파라미터 제거)
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        const errorData = await response.json();
        console.error('토큰 교환 실패:', errorData);
        setIsAuthenticated(false);
        alert(`토큰 교환 실패: ${errorData.error_description || errorData.error}`);
      }
    } catch (error) {
      console.error('토큰 교환 중 오류:', error);
      setIsAuthenticated(false);
      alert('토큰 교환 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleScroll = (id) => {
    const elem = document.querySelector(id);
    setClick(!click);
    scroll.scrollTo(elem, {
      offset: '-100',
      duration: '500',
      easing: [0.25, 0.0, 0.35, 1.0],
    });
  };

  const handleBonggenieClick = (event) => {
    event.preventDefault();
    console.log("봉지니 버튼 클릭됨");
    const accessToken = localStorage.getItem('accessToken');
    console.log("저장된 액세스 토큰:", accessToken ? '존재' : '없음');

    if (accessToken) {
      console.log("인증된 상태로 봉지니 페이지 접근");
      window.location.href = `${REDIRECT_URI}/bongjini.html`;
    } else {
      console.log("미인증 상태 - 로그인 페이지로 리디렉션");
      alert("BonGenie는 로그인 후 사용하실 수 있습니다. LOGIN / REGISTER 버튼을 클릭하여 로그인 또는 회원가입을 진행하세요.");
    }
  };

  const handleLogin = () => {
    console.log("로그인 버튼 클릭");
    const loginUrl = `${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=email+openid`;
    console.log("로그인 URL:", loginUrl);
    window.location.href = loginUrl;
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    
    setIsAuthenticated(false);

    const logoutUrl = `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location.href = logoutUrl;
  };

  return (
    <NavContainer
      click={+click}
      initial={{ y: `-100%` }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: 0 }}
    >
      <MenuItems
        drag="y"
        dragConstraints={{ top: 0, bottom: 70 }}
        dragElastic={0.05}
        dragSnapToOrigin
      >
        <MenuBtn onClick={() => setClick(!click)}>
          <span>MENU</span>
        </MenuBtn>

        <Item
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9, y: 0 }}
          onClick={() => handleScroll('#home')}
        >
          <Link to="/">Home</Link>
        </Item>

        <Item
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9, y: 0 }}
          onClick={() => handleScroll('.about')}
        >
          <Link to="/">About</Link>
        </Item>

        <Item
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9, y: 0 }}
          onClick={() => handleScroll('#shop')}
        >
          <Link to="/">Shop</Link>
        </Item>

        {!isAuthenticated ? (
          <Item
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9, y: 0 }}
            onClick={handleLogin}
          >
            <Link to="#" onClick={(e) => e.preventDefault()}>Login / Register</Link>
          </Item>
        ) : (
          <Item
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9, y: 0 }}
            onClick={handleLogout}
          >
            <Link to="#">Logout</Link>
          </Item>
        )}

        <Item
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9, y: 0 }}
          onClick={handleBonggenieClick}
        >
          <Link to="#">BONGGENIEV12</Link>
        </Item>
      </MenuItems>
    </NavContainer>
  );
};

export default Navbar;
