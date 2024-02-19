--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cartdetails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cartdetails (
    "user" character varying(255),
    id integer,
    quantity integer,
    name character varying(255),
    price numeric
);


ALTER TABLE public.cartdetails OWNER TO postgres;

--
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    "User" character varying(255),
    cartstatus integer,
    totalprice numeric
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- Name: orderdetails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orderdetails (
    orderid integer,
    id integer,
    quantity integer,
    name character varying(255),
    price numeric
);


ALTER TABLE public.orderdetails OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    orderid integer,
    status character varying(255),
    "User" character varying(255),
    "Total Price" numeric
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product (
    id integer NOT NULL,
    name character varying(255),
    description character varying(255),
    price numeric,
    category character varying(255),
    instock boolean
);


ALTER TABLE public.product OWNER TO postgres;

--
-- Name: product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_id_seq OWNER TO postgres;

--
-- Name: product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_id_seq OWNED BY public.product.id;


--
-- Name: product id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product ALTER COLUMN id SET DEFAULT nextval('public.product_id_seq'::regclass);


--
-- Data for Name: cartdetails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cartdetails ("user", id, quantity, name, price) FROM stdin;
nono	4	2	Fujifilm X-T4	1799.99
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts ("User", cartstatus, totalprice) FROM stdin;
nono	1	3599.98
\.


--
-- Data for Name: orderdetails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orderdetails (orderid, id, quantity, name, price) FROM stdin;
1	6	1	Canon EF 50mm f/1.8 STM Lens	125.99
1	1	1	Canon EOS 5D Mark IV	2499.99
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (orderid, status, "User", "Total Price") FROM stdin;
1	pending	nono	2625.98
\.


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product (id, name, description, price, category, instock) FROM stdin;
1	Canon EOS 5D Mark IV	30.4MP Full-Frame DSLR Camera	2499.99	Cameras	t
2	Sony Alpha a7 III	24.2MP Mirrorless Camera with 28-70mm Lens	1999.99	Cameras	t
3	Nikon Z6	24.5MP Mirrorless Camera with NIKKOR Z 24-70mm Lens	2399.99	Cameras	f
4	Fujifilm X-T4	26.1MP Mirrorless Camera with XF 18-55mm Lens	1799.99	Cameras	t
5	Panasonic Lumix GH5	20.3MP Mirrorless Camera with 12-60mm Lens	1799.99	Cameras	t
6	Canon EF 50mm f/1.8 STM Lens	Prime Lens for Canon DSLR Cameras	125.99	Lenses	t
7	Sigma 70-200mm f/2.8 DG OS HSM Sports Lens	Telephoto Zoom Lens for Nikon DSLR Cameras	1299.99	Lenses	t
8	Sony FE 24mm f/1.4 GM Lens	Wide-Angle Prime Lens for Sony Alpha Cameras	1399.99	Lenses	f
9	Nikon AF-S DX NIKKOR 35mm f/1.8G Lens	Wide-Angle Prime Lens for Nikon DSLR Cameras	199.99	Lenses	t
10	Tamron 24-70mm f/2.8 Di VC USD G2 Lens	Standard Zoom Lens for Canon DSLR Cameras	1199.99	Lenses	t
11	Manfrotto Befree Advanced Travel Tripod	Carbon Fiber 4-Section Tripod	349.99	Accessories	t
12	SanDisk Extreme PRO 128GB SDXC Memory Card	High-Speed UHS-I U3 V30 SD Card	39.99	Accessories	t
13	Peak Design Everyday Sling 5L	Compact Camera Bag	89.99	Accessories	f
14	Godox AD200Pro TTL Pocket Flash	Portable Strobe with Built-in Battery	299.99	Lighting	t
15	Wacom Intuos Pro Digital Graphic Drawing Tablet	Professional Pen Tablet for Digital Art	349.99	Accessories	t
\.


--
-- Name: product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_id_seq', 1, false);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

