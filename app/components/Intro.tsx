import { useLoaderData } from "@remix-run/react";
import classNames from "classnames";
import React from "react";
import type { LoaderData } from "../routes";

const Intro = ({ lng }: { lng: string }) => {
  const { works } = useLoaderData<LoaderData>();
  const isZh = lng === "zh";
  return (
    <section
      id="intro"
      data-scroll
      data-scroll-id="intro"
      data-scroll-section
      className="intro section"
    >
      <div className="intro-headline-box">
        <div className="intro-headline">
          <span className="intro-headline-word">
            <h1
              className="zh"
              data-scroll
              data-scroll-speed="3"
              data-scroll-delay="0.09"
              data-scroll-position="top"
              // data-scroll-direction="horizontal"
            >
              {isZh ? "戲劇" : "Drama"}
            </h1>
          </span>
          <span className="intro-headline-word">
            <h1
              className="zh"
              data-scroll
              data-scroll-speed="2"
              data-scroll-delay="0.06"
              data-scroll-position="top"
              // data-scroll-direction="horizontal"
            >
              {isZh ? "電影" : "Movie"}
            </h1>
          </span>
          <span className="intro-headline-word">
            <h1
              className="zh"
              data-scroll
              data-scroll-speed="2"
              data-scroll-delay="0.09"
              data-scroll-position="top"
              // data-scroll-direction="horizontal"
            >
              {isZh ? "⾏為藝術" : "Performance Art"}
            </h1>
          </span>
        </div>
        <div className="intro-photo-box">
          <div className="intro-photo-wrapper">
            <img
              data-scroll
              data-scroll-speed="4"
              className="intro-photo"
              src="/images/SydneyZhao_profilephoto.JPG"
              alt="Sydney Zhao"
            />
          </div>
        </div>
      </div>
      <div className="intro-subheadline-box">
        <div className="intro-subheadline">
          <span className="intro-subheadline-word">
            {isZh ? "简介" : "INTRO"}
          </span>
        </div>
        <div className="intro-subheadline">
          <span className="intro-subheadline-word">
            {isZh ? "作品" : "WORKS"}
          </span>
        </div>
      </div>
      <div className="intro-list">
        <div className="intro-list-text">
          <p className={classNames({ "zh": isZh })}>
            &nbsp;&nbsp;&nbsp;&nbsp;
            {isZh
              ? `趙悉尼是⻑駐武漢的演員和⾏為藝術家，畢業於美國賓夕法尼亞州狄⾦森學院並獲得經湾學學⼠學位，亦曾就讀美國戲劇學院劇院。曾在多部影視和戲劇作品中參與創作和表演，在多個藝術節進⾏⾏為藝術表演。主要表演經歷包括舞台劇《⿏疫（英⽂版）》（⾹港藝術節），《⽑猿》（江湖戲班），《武漢拼圖》（那甚麽實驗剑作⼩組）和電影《划過江⽔看⾒你》（⼭⼀⼥性電影展作品）。⾏為藝術作品曾參與「穀⾬⾏動」中國當代⾏為藝術城市聯合展演和「⽔泥公園」⾏為藝術節，擔任策展⼈策劃2020年⽔泥公園藝術節。`
              : `Sydney Zhao is an actor and a performance artist based in Wuhan.
                She holds a BA in economics from Dickinson College in
                Pennsylvania, USA and studied at the American Conservatory
                Theater. She has appeared in several theatre productions and art
                festivals. Her stage appearances include Plague (Hong Kong Art
                Festival), The Hairy Ape (Johoo Theatre), Wuhan Puzzle (So What
                Original) and Seeing You Through The River (The ONE
                International Women's Film Festival). Her performances were
                featured at Guyu Action [X-CFCA] and the Cement Park Art
                Festival (Sowerart), where at the latter she also worked as a
                curator.`}
          </p>
          <p className={classNames({ "zh": isZh })}>
            &nbsp;&nbsp;&nbsp;&nbsp;
            {isZh
              ? `趙悉尼以過程導向式的戲劇、影像和表演藝術，循着探索藝術、身體⾏為和⼼靈的旅程前進。⽬前正在計畫⼀項⻑期個⼈⾏為藝術項⽬，當中運⽤了⼯程師和物理學家費登奎斯的學說和依莎兰按摩艺术的部分理論。`
              : `She would continue her journey exploring art, human body
                movement and mind, through process-oriented action in the form
                of drama, dance and performance art. She is currently working on
                a performance art project which involves certain concepts of the
                Feldenkrais Method and of the healing arts of Esalen Massage.`}
          </p>
        </div>
        <div className="intro-list-items">
          <>
            {works.map((work) => (
              <div key={work.id} className="intro-list-item">
                <div className="intro-list-item-line">
                  <div className="intro-list-item-bg"></div>
                  <div
                    className={classNames(
                      "intro-list-item-name intro-list-item-col",
                      { zh: isZh }
                    )}
                  >
                    {isZh
                      ? `《${work.title}》${
                          work.title === "⿏疫" ? "英语版" : ""
                        }`
                      : `${work.name}`}
                  </div>
                  <div className="intro-list-item-date intro-list-item-col">
                    {work.date}
                  </div>
                  <div
                    className={classNames(
                      "intro-list-item-group intro-list-item-col",
                      { zh: isZh }
                    )}
                  >
                    {isZh ? work.groupTitle : work.groupName}
                  </div>
                </div>
                <div className="intro-list-item-hov-box">
                  {/* <div className="runningtext-bufferdiv intro-list-item-rt">
                      <div className="runningtext">
                        <div className="runningtext-11">{work.title}</div>
                        <div className="runningtext-12">{work.title}</div>
                      </div>
                    </div> */}
                </div>
              </div>
            ))}
          </>
        </div>
      </div>
    </section>
  );
};

export default React.memo(Intro);
