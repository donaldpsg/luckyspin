"use client";
import { Button } from "@/components/ui/button";
import { VStack, Icon, Box, Center, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { TbTriangleInvertedFilled } from "react-icons/tb";

export default function Page() {
  const [rotate, setRotate] = useState(0);
  const [easeOut, setEaseOut] = useState(0);
  const [angle, setAngle] = useState(0);
  const [top, setTop] = useState(0);
  const [offset, setOffset] = useState(0);
  const [result, setResult] = useState(-1);
  const [spinning, setSpining] = useState(false);

  const radius = 75;
  const data = [
    { label: "Discount 5%", bg: "#ef7b7b", color: "#000" },
    { label: "T-Shirt", bg: "#258261", color: "#fff" },
    { label: "Calendar", bg: "#dc332e", color: "#fff" },
    { label: "Umbrella", bg: "#fff", color: "#000" },
    { label: "Discount 12%", bg: "#FFD700", color: "#000" },
    { label: "Discount 5%", bg: "#ef7b7b", color: "#000" },
    { label: "T-Shirt", bg: "#258261", color: "#fff" },
    { label: "Calendar", bg: "#dc332e", color: "#fff" },
    { label: "Umbrella", bg: "#fff", color: "#000" },
    { label: "Discount 10%", bg: "#838383", color: "#fff" },
  ];

  const topPosition = (num: number, angle: number) => {
    // set starting index and angle offset based on list length
    // works upto 9 options
    let topSpot = 0;
    let degreesOff = 0;
    if (num === 10) {
      topSpot = 8;
      degreesOff = Math.PI / num;
    }
    if (num === 9) {
      topSpot = 7;
      degreesOff = Math.PI / 2 - angle * 2;
    } else if (num === 8) {
      topSpot = 6;
      degreesOff = 0;
    } else if (num <= 7 && num > 4) {
      topSpot = num - 1;
      degreesOff = Math.PI / 2 - angle;
    } else if (num === 4) {
      topSpot = num - 1;
      degreesOff = 0;
    } else if (num <= 3) {
      topSpot = num;
      degreesOff = Math.PI / 2;
    }

    setTop(topSpot - 1);
    setOffset(degreesOff);
  };

  const renderSector = (index: number, text: string, start: number, arc: number, bg: string, color: string) => {
    // create canvas arc for each list element
    let canvas = document.getElementById("wheel") as HTMLCanvasElement;
    if (canvas) {
      let ctx = canvas.getContext("2d");
      let x = canvas.width / 2;
      let y = canvas.height / 2;
      let startAngle = start;
      let endAngle = start + arc;
      let angle = index * arc;
      let baseSize = radius * 3.33;
      let textRadius = baseSize - 120;

      if (ctx) {
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle, false);
        ctx.lineWidth = radius * 3.2;
        ctx.strokeStyle = bg;

        ctx.font = "18px Roboto";
        ctx.fillStyle = color;
        ctx.stroke();
        ctx.shadowOffsetX = 1;

        // Konfigurasi shadow
        const distance = 5;
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)"; // Warna bayangan
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = distance * Math.cos(angle); // X offset
        ctx.shadowOffsetY = distance * Math.sin(angle); // Y offset

        ctx.save();
        ctx.translate(
          baseSize + Math.cos(angle - arc / 2) * textRadius,
          baseSize + Math.sin(angle - arc / 2) * textRadius
        );
        ctx.rotate(angle - arc + Math.PI / 10);
        ctx.fillText(text, -ctx.measureText(text).width / 1.5, 5);
        ctx.restore();
      }
    }
  };

  const renderWheel = () => {
    // determine number/size of sectors that need to created
    let numOptions = data.length;
    let arcSize = (2 * Math.PI) / numOptions;
    setAngle(arcSize);

    // get index of starting position of selector
    topPosition(numOptions, arcSize);

    // dynamically generate sectors from state list
    let angle = 0;
    for (let i = 0; i < 10; i++) {
      renderSector(i + 1, data[i].label, angle, arcSize, data[i].bg, data[i].color);
      angle += arcSize;
    }
  };

  useEffect(() => {
    renderWheel();
  }, [renderWheel]);

  const getResult = (spin: number) => {
    let netRotation = ((spin % 360) * Math.PI) / 180; // RADIANS
    let travel = netRotation + offset;
    let count = top + 1;

    while (travel > 0) {
      travel = travel - angle;
      count--;
    }

    let result;
    if (count >= 0) {
      result = count;
    } else {
      result = data.length + count;
    }

    setResult(result);
  };

  const spin = () => {
    // set random spin degree and ease out time
    // set state variables to initiate animation
    let randomSpin = Math.floor(Math.random() * 900) + 1000;
    setRotate(randomSpin);
    setEaseOut(4);
    setSpining(true);

    // calcalute result after wheel stops spinning
    setTimeout(() => {
      getResult(randomSpin);
    }, 4500);
  };

  const reset = () => {
    // reset wheel and result
    setRotate(0);
    setEaseOut(0);
    setResult(0);
    setSpining(false);
  };

  return (
    <VStack>
      <canvas
        id="wheel"
        width="500"
        height="500"
        style={{
          marginTop: 110,
          WebkitTransform: `rotate(${rotate}deg)`,
          WebkitTransition: `-webkit-transform ${easeOut}s ease-out`,
        }}
      />
      <Center>
        <Button colorPalette="red" onClick={spin} size="lg">
          SPIN TO WIN
        </Button>
      </Center>
      {result > -1 && (
        <Center>
          <Text color="red.700" textStyle="2xl">{` YOU WON : ${data[result].label}`}</Text>
        </Center>
      )}
      <Icon style={{ position: "absolute", top: 150 }} color="red.700" fontSize="3xl">
        <TbTriangleInvertedFilled />
      </Icon>
    </VStack>
  );
}
