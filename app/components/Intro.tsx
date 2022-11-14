import { useLoaderData } from "@remix-run/react";
import React from "react";

const Intro = ({ lng }: { lng: string }) => {
  const data = useLoaderData();
  console.log(data);
  const isZh = lng === "zh";
  return (
    <div id="intro" className="intro section">
      <div className="intro-headline-box">
        <span className="intro-headline">
          {isZh ? (
            <>
              <h1 className="zh">戲劇 </h1>
              <h1 className="zh">電影 </h1>
              <h1 className="zh">⾏為藝術</h1>
            </>
          ) : (
            <>
              <h1>Drama</h1>
              <h1>Movie</h1>
              <h1>Performance Art</h1>
            </>
          )}
        </span>
        <div className="intro-photo-box">
          <img
            className="intro-photo"
            src="/images/SydneyZhao_profilephoto.JPG"
            alt="Sydney Zhao"
          />
        </div>
      </div>
      <div className="intro-list">
        <div className="intro-list-text">
          {isZh ? (
            <>
              <p className="zh">
                &nbsp;&nbsp;&nbsp;&nbsp;趙悉尼是⻑駐武漢的演員和⾏為藝術家，畢業於美國賓夕法尼亞州狄⾦森學院並獲得經湾學學⼠學位，亦曾就讀美國戲劇學院劇院。曾在多部影視和戲劇作品中參與創作和表演，在多個藝術節進⾏⾏為藝術表演。主要表演經歷包括舞台劇《⿏疫（英⽂版）》（⾹港藝術節），《⽑猿》（江湖戲班），《武漢拼圖》（那甚麽實驗剑作⼩組）和電影《划過江⽔看⾒你》（⼭⼀⼥性電影展作品）。⾏為藝術作品曾參與「穀⾬⾏動」中國當代⾏為藝術城市聯合展演和「⽔泥公園」⾏為藝術節，擔任策展⼈策劃2020年⽔泥公園藝術節。
              </p>
              <p className="zh">
                &nbsp;&nbsp;&nbsp;&nbsp;趙悉尼以過程導向式的戲劇、影像和表演藝術，循着探索藝術、身體⾏為和⼼靈的旅程前進。⽬前正在計畫⼀項⻑期個⼈⾏為藝術項⽬，當中運⽤了⼯程師和物理學家費登奎斯的學說和依莎兰按摩艺术的部分理論。
              </p>
            </>
          ) : (
            <>
              <p>
                Sydney Zhao is an actor and a performance artist based in Wuhan.
                She holds a BA in economics from Dickinson College in
                Pennsylvania, USA and studied at the American Conservatory
                Theater. She has appeared in several theatre productions and art
                festivals. Her stage appearances include Plague (Hong Kong Art
                Festival), The Hairy Ape (Johoo Theatre), Wuhan Puzzle (So What
                Original) and Seeing You Through The River (The ONE
                International Women's Film Festival). Her performances were
                featured at Guyu Action [X-CFCA] and the Cement Park Art
                Festival (Sowerart), where at the latter she also worked as a
                curator.
              </p>
              <p>
                She would continue her journey exploring art, human body
                movement and mind, through process-oriented action in the form
                of drama, dance and performance art. She is currently working on
                a performance art project which involves certain concepts of the
                Feldenkrais Method and of the healing arts of Esalen Massage
              </p>
            </>
          )}
        </div>
        <div className="intro-list-items">
          {/* {isZh ? (
            <>
              {works.map((work) => (
                <div key={work.id} className="intro-list-item">
                  <div className="intro-list-item-bg"></div>
                  <div className="intro-list-item-name intro-list-item-col">
                    {work.title}
                  </div>
                  <div className="intro-list-item-date intro-list-item-col">
                    {work.date}
                  </div>
                  <div className="intro-list-item-group intro-list-item-col">
                    {work.groupTitle}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {works.map((work) => (
                <div key={work.id} className="intro-list-item">
                  <div className="intro-list-item-bg"></div>
                  <div className="intro-list-item-name intro-list-item-col">
                    {work.name}
                  </div>
                  <div className="intro-list-item-date intro-list-item-col">
                    {work.date}
                  </div>
                  <div className="intro-list-item-group intro-list-item-col">
                    {work.groupName}
                  </div>
                </div>
              ))}
            </>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Intro);
