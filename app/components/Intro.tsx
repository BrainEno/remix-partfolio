import classNames from "classnames";
import React from "react";
import { useForwardedRef } from "~/hooks/useForwardedRef";

interface IntroProps {
  isZh: boolean;
}

const Intro = React.forwardRef<HTMLDivElement, IntroProps>(function Intro(
  { isZh },
  ref
) {
  const introRef = useForwardedRef<HTMLDivElement>(ref);

  return (
    <section
      id="intro"
      data-scroll
      data-scroll-section
      data-scroll-id="intro"
      data-scroll-call="intro"
      data-scroll-repeat
      className="section"
      ref={introRef}
    >
      <div className="intro-headline-box">
        <span
          className={classNames("intro-headline-word word-1", { zh: isZh })}
        >
          <h1 className="zh">{isZh ? "⾏為藝術" : "Performance Art"}</h1>
        </span>
        <span
          className={classNames("intro-headline-word word-2", { zh: isZh })}
        >
          <h1 data-scroll data-scroll-speed="-0.5" className="zh">
            {isZh ? "電影" : "Movie"}
          </h1>
        </span>
        <span
          className={classNames("intro-headline-word word-3", { zh: isZh })}
        >
          <h1 className="zh">{isZh ? "戲劇" : "Drama"}</h1>
        </span>

        <div className="intro-headline-bar bar-1">
          <div className="intro-headline-bar-wrapper">
            <img
              data-scroll
              data-scroll-speed="4"
              className="intro-headline-bar-image"
              src="/images/figure.webp"
              alt="bar"
              loading="eager"
            />
          </div>
        </div>
        <div className="intro-headline-bar bar-2">
          <div className="intro-headline-bar-wrapper">
            <img
              data-scroll
              data-scroll-speed="4"
              className="intro-headline-bar-image"
              src="/images/figure.webp"
              alt="bar"
              loading="eager"
            />
          </div>
        </div>
        <div className="intro-photo-box">
          <div className="intro-photo-wrapper">
            <img
              data-scroll
              data-scroll-speed="-2"
              className="intro-photo"
              src="/images/figure.webp"
              alt="figure"
              loading="eager"
            />
          </div>
        </div>
      </div>

      <section>
        <div className="intro-subheadline-stickytainer">
          <div className="intro-subheadline-wrapper">
            <div className="intro-subheadline-photo-box">
              <div className="intro-subheadline-photo-mask">
                <img
                  src="/images/profilephoto.jpg"
                  alt="Sydney Zhao Portrait"
                  loading="lazy"
                  className="intro-subheadline-photo"
                />
              </div>
              <div className="intro-subheadline-pic-info">
                <div className="right">Sydney Zhao</div>
                <div className="subheadline-ball"></div>
              </div>
              <div className="intro-subheadline-photo-ghost-mask">
                <img
                  src="/images/profilephoto.jpg"
                  alt="Sydney Zhao Portrait"
                  loading="lazy"
                  className="intro-subheadline-ghost-photo"
                />
              </div>
            </div>
            <div className="intro-subheadline-slider">
              <div
                className={classNames("intro-subheadline-title", { zh: isZh })}
              >
                <h1>{isZh ? "簡介" : "Intro"}</h1>
              </div>
              <div className="intro-subheadline-text-box1">
                <p
                  className={classNames(
                    "intro-subheadline-text intro-subheadline-text1",
                    { zh: isZh }
                  )}
                >
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
              </div>
            </div>
          </div>
        </div>

        <div className="intro-subheadline-stickytainer2">
          <div className="intro-subheadline-wrapper2">
            <div className="intro-subheadline-photo-box2">
              <div className="intro-subheadline-photo-mask2">
                <img
                  src="/images/tree1.jpg"
                  alt="profile pic1"
                  loading="lazy"
                  className="intro-subheadline-photo2"
                />
              </div>
              <div className="intro-subheadline-photo-mask2">
                <img
                  src="/images/tree3.jpg"
                  alt="profile pic2"
                  loading="lazy"
                  className="intro-subheadline-photo2"
                />
              </div>
              <div className="intro-subheadline-photo-mask2">
                <img
                  src="/images/tree4.jpg"
                  alt="profile pic2"
                  loading="lazy"
                  className="intro-subheadline-photo2"
                />
              </div>
              <div className="intro-subheadline-photo-mask2">
                <img
                  src="/images/tree2.jpg"
                  alt="profile pic2"
                  loading="lazy"
                  className="intro-subheadline-photo2"
                />
              </div>
              <div className="intro-subheadline-photo-mask2">
                <img
                  src="/images/tree5.jpg"
                  alt="profile pic2"
                  loading="lazy"
                  className="intro-subheadline-photo2"
                />
              </div>
            </div>
            <div className="intro-subheadline-slider2">
              <div className="intro-subheadline-text-box2">
                <img
                  src="/images/hairyApe.png"
                  alt="pic6"
                  className="intro-subheadline-text2-pic1"
                />
                <img
                  src="/images/show.png"
                  alt="pic7"
                  className="intro-subheadline-text2-pic2"
                />
                <p
                  className={classNames(
                    "intro-subheadline-text intro-subheadline-text2",
                    { zh: isZh }
                  )}
                >
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
            </div>
          </div>
        </div>
      </section>
    </section>
  );
});

export default Intro;
