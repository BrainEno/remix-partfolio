import classNames from "classnames";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useForwardedRef } from "~/hooks/useForwardedRef";
import type { Language } from "../routes";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

interface IntroProps {
  isZh: boolean;
}

const Intro = React.forwardRef<HTMLDivElement, IntroProps>(function Intro(
  { isZh },
  ref
) {
  const introRef = useForwardedRef<HTMLDivElement>(ref);
  const subheadlineRef = useRef<HTMLDivElement | null>(null);
  const horizontalRef = useRef<HTMLDivElement | null>(null);

  gsap.registerPlugin(ScrollTrigger);

  useEffect(() => {
    const element = subheadlineRef.current;
    const scrollingElement = horizontalRef.current;
    const pinWrapWidth = scrollingElement?.offsetWidth;
    console.log(pinWrapWidth);
    setTimeout(() => {
      const t1 = gsap.timeline({
        scrollTrigger: {
          trigger: ".intro-subheadline-photo-box",
          start: "top center",
          end: "1080 bottom",
          markers: true,
          scroller: "#container",
          scrub: true,
        },
        defaults: { ease: "none", duration: 15, delay: 5 },
      });

      t1.to(".intro-subheadline-photo-box", {
        rotation: 0,
        y: "480",
        x: "-240",
        scale: "1.25",
        autoAlpha: "0.8",
        ease: "slow(0.7, 0.7, false)",
      }).to(
        ".intro-subheadline-title",
        {
          y: -80,
          x: -280,
          scale: 0.15,
          fontWeight: 300,
        },
        "<-=3"
      );

      // if (subheadlineRef.current && horizontalRef.current) {
      //   const t2 = gsap.timeline({
      //     scrollTrigger: {
      //       trigger: element,
      //       start: "-=700 top",
      //       end: `${pinWrapWidth}px 80%`,
      //       endTrigger: "#partfolio",
      //       markers: true,
      //       scroller: "#container",
      //       scrub: true,
      //     },
      //     defaults: { ease: "none", duration: 3 },
      //   });

      //   t2.to(".intro-subheadline-photo-box", {
      //     rotation: 0,
      //     y: "780",
      //     x: "-240",
      //     scale: "1.25",
      //     autoAlpha: "0.8",
      //     ease: "slow(0.7, 0.7, false)",
      //   })
      //     .to(
      //       ".intro-subheadline-photo-box",
      //       {
      //         width: "+=300",
      //         height: "-=0",
      //         clipPath: "inset(0% 0% 0% 0% round 50% 0 0 0)",
      //       },
      //       ">-=2"
      //     )
      //     .to(
      //       ".intro-subheadline-title",
      //       {
      //         y: 150,
      //         x: -200,
      //         scale: 0.25,
      //       },
      //       ">-=3"
      //     )
      //     .to(
      //       ".intro-subheadline",
      //       {
      //         height: `${scrollingElement?.scrollWidth}px`,
      //       },
      //       ">"
      //     );

      console.log("scroll width",scrollingElement?.scrollWidth);
      gsap.to(".intro-subheadline", {
        scrollTrigger: {
          trigger: element,
          start: "center top",
          end: `${pinWrapWidth}px`,
          markers: true,
          scroller: "#container",
          scrub: true,
          pin: true,
          pinSpacing: false,
        },
        height: `${scrollingElement?.scrollWidth}px`,
      });

      console.log("pinWrapWidth",pinWrapWidth)

      let t3 = gsap.timeline({
        scrollTrigger: {
          trigger: ".intro-subheadline-text-box1",
          scroller: "#container",
          start: "center center",
          end: `bottom+=${pinWrapWidth}`,
          scrub: true,
        },
        defaults: { duration: 8 },
      });

      t3.to(
        ".intro-subheadline-photo-box",
        {
          width: "+=300",
          height: "-=0",
          clipPath: "inset(0% 0% 0% 0% round 25% 0 0 0)",
        },
        ">10"
      )
        .to(
          ".intro-subheadline-photo-box",
          {
            x: -1400,
          },
          ">"
        )
        .to(
          ".intro-subheadline-title",
          {
            x: -1000,
          },
          "<-=3"
        )
        .to(
          ".intro-subheadline-text1",
          {
            x: "-100vw",
          },
          "-=4"
        )
        .to(
          "intro-subheadline-text1",
          {
            y: "-50%",
          },
          "<10"
        );
    }, 1000);
    ScrollTrigger.refresh();
  }, []);

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
          <h1 className="zh">{isZh ? "電影" : "Movie"}</h1>
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
            />
          </div>
        </div>
      </div>

      <div className="intro-subheadline" ref={subheadlineRef}>
        <div className="intro-subheadline-photo-box">
          <img
            src="/images/profilephoto.jpg"
            alt="Profile"
            className="intro-subheadline-photo"
          />
        </div>
        <div className="intro-subheadline-title">
          <h1>INTRO</h1>
        </div>

        <div className="intro-subheadline-text-box1" ref={horizontalRef}>
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

        <div className="intro-subheadline-text-box2">
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
    </section>
  );
});

export default Intro;
