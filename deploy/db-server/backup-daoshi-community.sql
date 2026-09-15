--
-- PostgreSQL database dump
--

\restrict zfZLErhFfWZEfCD1WvLo5b93940V6Z5GuLvUr2qmhIiD2Awsr238zQWCcgvjPH6

-- Dumped from database version 15.19
-- Dumped by pg_dump version 15.19

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: account_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.account_status AS ENUM (
    'active',
    'disabled'
);


--
-- Name: audit_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.audit_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: lead_global_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.lead_global_status AS ENUM (
    'pending',
    'assigned',
    'rejected'
);


--
-- Name: request_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.request_type AS ENUM (
    'first_publish',
    'profile_update'
);


--
-- Name: tutor_process_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tutor_process_status AS ENUM (
    'todo',
    'doing',
    'done'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'superadmin',
    'manager',
    'tutor'
);


--
-- Name: work_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.work_type AS ENUM (
    'image',
    'video_link'
);


--
-- Name: trigger_set_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_set_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type public.request_type NOT NULL,
    draft_json jsonb NOT NULL,
    status public.audit_status DEFAULT 'pending'::public.audit_status NOT NULL,
    reject_reason character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    processed_at timestamp with time zone
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    title character varying(120) NOT NULL,
    badge character varying(50) DEFAULT ''::character varying NOT NULL,
    duration character varying(120) DEFAULT ''::character varying NOT NULL,
    price character varying(20) DEFAULT ''::character varying NOT NULL,
    summary text DEFAULT ''::text NOT NULL,
    details jsonb DEFAULT '[]'::jsonb NOT NULL,
    fit character varying(200) DEFAULT ''::character varying NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wechat_qq character varying(100) NOT NULL,
    level character varying(20) NOT NULL,
    learning_request text NOT NULL,
    time_note character varying(100),
    intent_tutor_id uuid,
    course_name character varying(100),
    course_code character varying(50),
    status public.lead_global_status DEFAULT 'pending'::public.lead_global_status NOT NULL,
    assigned_tutor_id uuid,
    tutor_status public.tutor_process_status DEFAULT 'todo'::public.tutor_process_status,
    tutor_note character varying(255),
    assigned_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    course_price character varying(20)
);


--
-- Name: tutor_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tutor_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    display_name character varying(50) NOT NULL,
    title character varying(100) NOT NULL,
    avatar_url character varying(500),
    bio_text text,
    tags_json jsonb DEFAULT '[]'::jsonb,
    is_published boolean DEFAULT false NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: tutor_works; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tutor_works (
    id integer NOT NULL,
    profile_id uuid NOT NULL,
    type public.work_type NOT NULL,
    url character varying(500) NOT NULL,
    raw_video_url character varying(500),
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: tutor_works_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tutor_works_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tutor_works_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tutor_works_id_seq OWNED BY public.tutor_works.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(50) NOT NULL,
    role public.user_role DEFAULT 'tutor'::public.user_role NOT NULL,
    status public.account_status DEFAULT 'active'::public.account_status NOT NULL,
    admin_note character varying(255),
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: tutor_works id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutor_works ALTER COLUMN id SET DEFAULT nextval('public.tutor_works_id_seq'::regclass);


--
-- Data for Name: audit_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_requests (id, user_id, type, draft_json, status, reject_reason, created_at, processed_at) FROM stdin;
e9bccfdd-3264-4eec-a5ec-ea655efef569	1b1510d5-2ab0-4f7f-a76c-9291ee160b00	first_publish	{"bio": "cs", "name": "cs", "tags": ["新人入驻"], "title": "cs", "works": [], "avatar": "/uploads/1788323825070-458488120.jpg"}	approved	\N	2026-09-02 12:37:07.869955+08	2026-09-02 12:37:52.958598+08
355960bd-e83c-47f9-8161-d0366ae5d5b4	068df27a-e863-45f5-8ba5-601b6788d3ab	first_publish	{"bio": "阿爸打撒飒飒潇洒啊啊啊啊啊啊啊啊啊啊啊啊啊顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶", "name": "默默", "tags": ["新人入驻"], "title": "二次元/女频", "works": [], "avatar": "/uploads/1788330196290-795454520.jpg"}	approved	\N	2026-09-02 14:23:18.864579+08	2026-09-02 14:23:38.266095+08
cae1c30a-761c-43bc-a74c-abc102815cb1	068df27a-e863-45f5-8ba5-601b6788d3ab	profile_update	{"id": "068df27a-e863-45f5-8ba5-601b6788d3ab", "bio": "阿爸打撒飒飒潇洒啊啊啊啊啊啊啊啊啊啊啊啊啊顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶", "name": "默默", "tags": ["二次元", "女频", "百万主播"], "email": "333333@qq.com", "title": "二次元/女频", "works": [{"url": "/uploads/1788330278239-639200877.jpg", "type": "image"}, {"url": "/uploads/1788330285433-287815110.png", "type": "image"}], "avatar": "/uploads/1788330196290-795454520.jpg", "isPublished": true}	approved	\N	2026-09-02 14:24:46.914513+08	2026-09-02 14:24:54.869799+08
fe74f838-fecb-4449-a81e-140f74575767	068df27a-e863-45f5-8ba5-601b6788d3ab	profile_update	{"id": "068df27a-e863-45f5-8ba5-601b6788d3ab", "bio": "善长女频，分镜，抖音百万博主。", "name": "默默", "tags": ["二次元", "女频", "百万主播"], "email": "333333@qq.com", "title": "二次元/女频", "works": [{"raw": null, "url": "/uploads/1788330278239-639200877.jpg", "type": "image"}, {"raw": null, "url": "/uploads/1788330285433-287815110.png", "type": "image"}], "avatar": "/uploads/1788330196290-795454520.jpg", "isPublished": true}	approved	\N	2026-09-15 16:00:20.54765+08	2026-09-15 16:01:29.418785+08
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.courses (id, code, title, badge, duration, price, summary, details, fit, sort_order, is_active, created_at, updated_at) FROM stdin;
48b455eb-3535-45bd-a0f6-47bbbb934776	COURSE-02	AI 创作工作流课	1 小时	核心流程 · 快速入门	100	用一套清晰流程串联灵感、提示词、分镜与生成工具，减少反复试错，稳定推进项目。	["建立从灵感到成片的标准工作顺序。", "统一提示词、参考图和生成记录的管理方式。", "用低成本步骤把卡点从“试出来”改成“流程化”。"]	适合：想提升效率的创作者	2	t	2026-09-15 16:12:23.537096+08	2026-09-15 16:12:23.537096+08
f761dd5e-ec58-4448-8aeb-a7eb0c433670	COURSE-03	即梦实战工作流	2 小时	完整实战 · 案例拆解	298	从参考图、角色一致性到动态生成与成片复盘，完整跑通即梦 AI 影像制作链路。	["理解角色一致性、镜头节奏和素材复用的关系。", "把单张图、连续镜头和动效素材组织成可交付成片。", "通过案例复盘减少参数碰运气。"]	适合：准备独立完成作品的人	3	t	2026-09-15 16:12:23.538534+08	2026-09-15 16:12:23.538534+08
bde4158e-9e8f-48fd-a4f8-8c6d319524b2	COURSE-01	小说转剧本课	录播课	随时学 · 反复看	58	把小说语言翻译成镜头语言。涵盖冲突提炼、人物动机、场景拆分与可拍摄的剧本格式。	["拆解叙事骨架，找到真正能拍的戏眼。", "把长篇小说改成更适合短内容传播的场景节奏。", "输出可直接进入分镜与生成环节的剧本结构。"]	适合：小说作者 / 入门创作者	1	t	2026-09-15 16:12:23.534828+08	2026-09-15 16:16:11.675907+08
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leads (id, wechat_qq, level, learning_request, time_note, intent_tutor_id, course_name, course_code, status, assigned_tutor_id, tutor_status, tutor_note, assigned_at, created_at, updated_at, course_price) FROM stdin;
146d9018-d519-4e64-995f-2f8aad07a196	121	零基础小白	121		068df27a-e863-45f5-8ba5-601b6788d3ab	AI 创作工作流课	COURSE-02	assigned	068df27a-e863-45f5-8ba5-601b6788d3ab	todo	\N	2026-09-15 14:16:24.682667+08	2026-09-15 14:16:10.599014+08	2026-09-15 16:10:04.625878+08	100
\.


--
-- Data for Name: tutor_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tutor_profiles (id, user_id, display_name, title, avatar_url, bio_text, tags_json, is_published, is_featured, created_at, updated_at) FROM stdin;
6b4ca287-6e4a-41c9-a1bc-3143ca54c98b	1b1510d5-2ab0-4f7f-a76c-9291ee160b00	cs	cs	/uploads/1788323825070-458488120.jpg	cs	[]	t	f	2026-09-02 12:37:52.958598+08	2026-09-02 12:58:44.800041+08
33d17106-7b33-4d61-ac3e-13284583d061	068df27a-e863-45f5-8ba5-601b6788d3ab	默默	二次元/女频	/uploads/1788330196290-795454520.jpg	善长女频，分镜，抖音百万博主。	["二次元", "女频", "百万主播"]	t	f	2026-09-02 14:23:38.266095+08	2026-09-15 16:01:29.418785+08
87f6abcd-90f0-4b9b-9a5a-847c7c9ffc57	6efbe5d6-6d0d-42dd-b87b-725eefe8f201	沈九	AI 工作流 / 提示词工程	/assets/mentor-shenjiu.png	重度工具控，把 AI 生成流程拆成了可复用的标准步骤。不讲玄学参数，只讲怎么让每一次生成都不白费。	["AI 工作流", "提示词", "效率工具"]	t	t	2026-09-15 16:17:32.488752+08	2026-09-15 16:19:29.036425+08
472e074a-771d-428b-9b55-6ff8046175a3	c2994980-131b-44da-94ac-a4936ba74723	苏晚	分镜设计 / 镜头语言	/assets/mentor-suwan.png	做过三年动态漫分镜。擅长用最少的镜头讲清楚一件事，帮你解决「画面很漂亮但看不懂在讲什么」的问题。	["分镜", "镜头语言", "动态漫"]	t	t	2026-09-15 16:17:32.488752+08	2026-09-15 16:19:29.036425+08
0e0b0806-f78a-4cad-92ac-d2aaae118896	eb9f9575-70fc-4874-84ec-224cdbd20347	陈默	即梦实战 / 角色一致性	/assets/mentor-chenmo.png	专注即梦 AI 的影像链路，从参考图到成片全程实战。最常被问的问题是角色长得不一样，这里有一套稳定解法。	["即梦", "角色一致性", "成片复盘"]	t	t	2026-09-15 16:17:32.488752+08	2026-09-15 16:19:29.036425+08
1d16b2ea-0221-4972-bfe0-edcd934d446a	6fd5202d-d9e4-4cf1-93d1-cb1c22a54a07	周砚	视觉风格 / 美术方向	/assets/mentor-zhouyan.png	前广告美术，现在专门给漫剧定视觉基调。帮你从一开始就想清楚这支片子长什么样，而不是边做边撞。	["视觉风格", "美术指导", "色彩"]	t	f	2026-09-15 16:17:32.488752+08	2026-09-15 16:19:29.036425+08
bc1f9f76-df77-4d09-bc18-c49447ad6b80	6b3197c8-2026-4241-a978-3a8145cc426b	胡玥	短视频运营 / 选题拆解	/assets/mentor-huyue.png	负责过多个百万播放账号。擅长从数据反推选题，让你的漫剧不只做得出来，还能有人看。	["选题", "短视频", "数据复盘"]	t	f	2026-09-15 16:17:32.488752+08	2026-09-15 16:19:29.036425+08
caa081e4-01b8-4d6e-b6e0-7144c0957705	6bc34e82-4b22-4c7d-aaa2-ff457b6630ce	林小满	小说改编 / 剧本结构	/assets/mentor-linxiaoman.png	写了八年网文，转做漫剧剧本改编。擅长把长篇叙事压缩成 60 秒能讲完的钩子，带你把「好看的小说」改成「拍得出来的剧本」。	["小说改编", "剧本结构", "节奏设计"]	t	t	2026-09-15 16:17:32.488752+08	2026-09-15 16:19:29.036425+08
\.


--
-- Data for Name: tutor_works; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tutor_works (id, profile_id, type, url, raw_video_url, sort_order, created_at) FROM stdin;
3	33d17106-7b33-4d61-ac3e-13284583d061	image	/uploads/1788330278239-639200877.jpg	\N	0	2026-09-15 16:01:29.418785+08
4	33d17106-7b33-4d61-ac3e-13284583d061	image	/uploads/1788330285433-287815110.png	\N	0	2026-09-15 16:01:29.418785+08
5	caa081e4-01b8-4d6e-b6e0-7144c0957705	image	/uploads/1788330278239-639200877.jpg	\N	0	2026-09-15 16:17:45.355333+08
6	caa081e4-01b8-4d6e-b6e0-7144c0957705	image	/uploads/1788330285433-287815110.png	\N	1	2026-09-15 16:17:45.355333+08
7	87f6abcd-90f0-4b9b-9a5a-847c7c9ffc57	image	/uploads/1788330285433-287815110.png	\N	0	2026-09-15 16:17:45.363481+08
8	472e074a-771d-428b-9b55-6ff8046175a3	image	/uploads/1788330278239-639200877.jpg	\N	0	2026-09-15 16:17:45.365841+08
9	472e074a-771d-428b-9b55-6ff8046175a3	video_link	//player.bilibili.com/player.html?bvid=BV1GJ411x7h7&page=1&high_quality=1	https://www.bilibili.com/video/BV1GJ411x7h7	1	2026-09-15 16:17:45.365841+08
10	0e0b0806-f78a-4cad-92ac-d2aaae118896	image	/uploads/1788330285433-287815110.png	\N	0	2026-09-15 16:17:45.367666+08
11	0e0b0806-f78a-4cad-92ac-d2aaae118896	image	/uploads/1788330278239-639200877.jpg	\N	1	2026-09-15 16:17:45.367666+08
12	1d16b2ea-0221-4972-bfe0-edcd934d446a	image	/uploads/1788330278239-639200877.jpg	\N	0	2026-09-15 16:17:45.369463+08
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, name, role, status, admin_note, last_login_at, created_at, updated_at) FROM stdin;
1b1510d5-2ab0-4f7f-a76c-9291ee160b00	222222@qq.com	$2b$10$X5kGWTzhAfXL.e9yJm6w..RZWjstlgjbgNdeg6i22USgy0E4ui5Ke	cs	tutor	active	\N	\N	2026-09-02 12:37:07.869955+08	2026-09-02 12:37:52.958598+08
068df27a-e863-45f5-8ba5-601b6788d3ab	333333@qq.com	$2b$10$PGa/JH26EMg0bdGwTATiF.IsGzgmXRYTdTD3dpI3nKJ86OdEvvSma	默默	tutor	active	\N	2026-09-15 15:59:02.446747+08	2026-09-02 14:23:18.864579+08	2026-09-15 15:59:02.446747+08
00000000-0000-0000-0000-000000000000	admin	$2b$10$hCeKU8xq40gJeh7f43gRh.ZwGcE5TnLBXB8nvJYMEhgWNglBQcaMq	超级管理员	superadmin	active	系统初始化生成	2026-09-15 16:01:13.683158+08	2026-09-02 12:28:11.735747+08	2026-09-15 16:01:13.683158+08
6efbe5d6-6d0d-42dd-b87b-725eefe8f201	shenjiu@manju.test	$2a$10$g2T7xVjky6X3yDY8yspEduUnOy.aR75nxVTvT1u9CE9rclMNblwDK	沈九	tutor	active	演示导师数据	\N	2026-09-15 16:17:32.17985+08	2026-09-15 16:17:32.17985+08
c2994980-131b-44da-94ac-a4936ba74723	suwan@manju.test	$2a$10$C.SNDeroVO9XHocqN7uMhevmMjGDTXhiOSmQnRh4sIuRUptk2PKCu	苏晚	tutor	active	演示导师数据	\N	2026-09-15 16:17:32.17985+08	2026-09-15 16:17:32.17985+08
eb9f9575-70fc-4874-84ec-224cdbd20347	chenmo@manju.test	$2a$10$VZc2LhDnuZ.JDa3epolV1u4B5/4D7eJkjZmuxPzdMdm4EIhL5TWC2	陈默	tutor	active	演示导师数据	\N	2026-09-15 16:17:32.17985+08	2026-09-15 16:17:32.17985+08
6fd5202d-d9e4-4cf1-93d1-cb1c22a54a07	zhouyan@manju.test	$2a$10$.p77RLwj0cv1lW58vwvTIeBx.BFzm9fCeeypK6fL6TA3JXgBmldw.	周砚	tutor	active	演示导师数据	\N	2026-09-15 16:17:32.17985+08	2026-09-15 16:17:32.17985+08
6b3197c8-2026-4241-a978-3a8145cc426b	huyue@manju.test	$2a$10$aI5qtRmG88C2Ex1jWbkHH.qjUdiczkiTLCcaNQbs5RC.fuU76Pvyi	胡玥	tutor	active	演示导师数据	\N	2026-09-15 16:17:32.17985+08	2026-09-15 16:17:32.17985+08
6bc34e82-4b22-4c7d-aaa2-ff457b6630ce	linxiaoman@manju.test	$2a$10$f0UR.WX3Dg2aGfd1IOIBS.OhMWjoJEMvAwQgON8pcNqEwisKSdpuq	林小满	tutor	active	演示导师数据	2026-09-15 16:20:12.636166+08	2026-09-15 16:17:32.17985+08	2026-09-15 16:20:12.636166+08
\.


--
-- Name: tutor_works_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tutor_works_id_seq', 12, true);


--
-- Name: audit_requests audit_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_requests
    ADD CONSTRAINT audit_requests_pkey PRIMARY KEY (id);


--
-- Name: courses courses_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_code_key UNIQUE (code);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: tutor_profiles tutor_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutor_profiles
    ADD CONSTRAINT tutor_profiles_pkey PRIMARY KEY (id);


--
-- Name: tutor_profiles tutor_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutor_profiles
    ADD CONSTRAINT tutor_profiles_user_id_key UNIQUE (user_id);


--
-- Name: tutor_works tutor_works_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutor_works
    ADD CONSTRAINT tutor_works_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: leads set_timestamp_leads; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp_leads BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: tutor_profiles set_timestamp_tutor_profiles; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp_tutor_profiles BEFORE UPDATE ON public.tutor_profiles FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: users set_timestamp_users; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: leads leads_assigned_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_assigned_tutor_id_fkey FOREIGN KEY (assigned_tutor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: leads leads_intent_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_intent_tutor_id_fkey FOREIGN KEY (intent_tutor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tutor_profiles tutor_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutor_profiles
    ADD CONSTRAINT tutor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tutor_works tutor_works_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutor_works
    ADD CONSTRAINT tutor_works_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.tutor_profiles(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict zfZLErhFfWZEfCD1WvLo5b93940V6Z5GuLvUr2qmhIiD2Awsr238zQWCcgvjPH6

