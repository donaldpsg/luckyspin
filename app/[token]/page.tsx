"use client";

import { VStack, Center, Image, Heading, Spinner, Flex, Text, Link } from "@chakra-ui/react";
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from 'next/navigation'
import { Roboto } from 'next/font/google'
import * as htmlToImage from "html-to-image";

const roboto = Roboto({
    weight: '700',
    subsets: ['latin'],
    display: 'swap',
})

export default function Page() {
    const [rotate, setRotate] = useState(0);
    const [easeOut, setEaseOut] = useState(0);
    const [angle, setAngle] = useState(0);
    const [top, setTop] = useState(0);
    const [offset, setOffset] = useState(0);
    const [result, setResult] = useState(-1);
    const [nama_client, setNamaClient] = useState("")
    const [logo, setLogo] = useState('/images/logo-spin.png')
    const [loading, setLoading] = useState(true)
    const params = useParams<{ token: string }>()
    const url_api = "https://visa.peaksolutions.co.id/api/public/public/lucky_spin"
    const token = params.token

    const radius = 75;
    const data = useMemo(() => [
        { label: "T-Shirt", bg: "#e50305", color: "#000", type: 0 },
        { label: "Calendar", bg: "#fff", color: "#000", type: 1 },
        { label: "Hampers", bg: "#e50305", color: "#fff", type: 1 },
        { label: "Umbrella", bg: "#fff", color: "#000", type: 1 },
        { label: "Discount 12%", bg: "#e50305", color: "#000", type: 0 },
        { label: "Discount 5%", bg: "#fff", color: "#000", type: 0 },
        { label: "Calendar", bg: "#e50305", color: "#fff", type: 1 },
        { label: "Hampers", bg: "#fff", color: "#000", type: 1 },
        { label: "Umbrella", bg: "#e50305", color: "#000", type: 1 },
        { label: "Discount 10%", bg: "#fff", color: "#000", type: 0 },
    ], []); //

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
        const canvas = document.getElementById("wheel") as HTMLCanvasElement;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            const x = canvas.width / 2;
            const y = canvas.height / 2;
            const startAngle = start;
            const endAngle = start + arc;
            const angle = index * arc;
            const baseSize = radius * 3.33;
            const textRadius = baseSize - 130; // posisi huruf dari tengah ke tepi

            if (ctx) {
                ctx.beginPath();
                ctx.arc(x, y, radius, startAngle, endAngle, false);
                ctx.lineWidth = radius * 2.5;
                ctx.strokeStyle = bg;

                ctx.font = "16px Roboto";
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
                ctx.fillText(text, -ctx.measureText(text).width / 1.5, 6);
                ctx.restore();
            }
        }
    };


    const renderWheel = useCallback(async () => {
        // determine number/size of sectors that need to created
        const numOptions = data.length;
        const arcSize = (2 * Math.PI) / numOptions;
        setAngle(arcSize);

        // get index of starting position of selector
        topPosition(numOptions, arcSize);

        // dynamically generate sectors from state list
        let angle = 0;
        for (let i = 0; i < 10; i++) {
            renderSector(i + 1, data[i].label, angle, arcSize, data[i].bg, data[i].color);
            angle += arcSize;
        }
    }, [data])

    const checkToken = useCallback(async () => {
        const res = await fetch(`${url_api}/${token}`, { method: 'GET' });
        const results = await res.json();
        const dt = results.data;
        setNamaClient(dt.nama_client)
        if (dt.result >= 0 && dt.result !== null) {
            setLogo('/images/logo-spin-clicked.png')
            //setResult(dt.result)

            setRotate(dt.rotate);
            setEaseOut(4);
            setTimeout(() => {
                setResult(dt.result);
            }, 4500);
        }

    }, [token])

    useEffect(() => {
        renderWheel();
        checkToken();
        setLoading(false)
    }, [renderWheel, checkToken]);

    const getResult = async (spin: number) => {
        const netRotation = ((spin % 360) * Math.PI) / 180; // RADIANS
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

        const fd = new FormData();
        fd.append('result', result.toString());
        fd.append('rotate', spin.toString());

        const res = await fetch(`${url_api}/${token}`, { method: 'POST', body: fd });
        await res.json();
    };

    const spin = () => {
        if (result === -1) {
            setLogo('/images/logo-spin-clicked.png')
            const randomSpin = Math.floor(Math.random() * 900) + 1000;
            setRotate(randomSpin);
            setEaseOut(4);

            // calcalute result after wheel stops spinning
            setTimeout(() => {
                getResult(randomSpin);
            }, 4500);
        }
    };

    const download = () => {
        const element = document.getElementById("result");

        if (element) {
            htmlToImage.toJpeg(element, { quality: 0.95 }).then(function (dataUrl) {
                const link = document.createElement("a");
                link.download = `Spin-${nama_client}.jpeg`;
                link.href = dataUrl;
                link.click();
            });
        }

    };

    return (
        <div style={{ background: "#f8f4f0" }}>
            <VStack id="result" style={{ backgroundImage: "url(images/background.png)", backgroundSize: "cover", backgroundPosition: "center" }}>
                {loading ?
                    (
                        <Flex
                            height="100vh"            // Menggunakan tinggi layar penuh
                            justify="center"          // Memusatkan elemen secara horizontal
                            align="center"            // Memusatkan elemen secara vertikal
                        >
                            <Spinner color="red.700" size="xl" />
                        </Flex>
                    ) : (
                        <>
                            <Heading size="lg" style={{ position: "absolute", top: 105 }} className={roboto.className} color="red.700">HI, {nama_client.toUpperCase()}</Heading>
                            <Center style={{ position: "absolute", top: 130 }} bg="red.700" color='white' width='60%'>
                                <Heading className={roboto.className} letterSpacing={0.5} size="lg"> Spin the wheel to win!</Heading>
                            </Center>
                        </>
                    )
                }

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

                {!loading && (
                    <>
                        <Image
                            src="/images/pointer.png"
                            style={{ position: "absolute", top: 170, width: 20 }}
                            onClick={spin}
                            alt="Pointer"
                        />
                        <Image
                            src={logo}
                            style={{ position: "absolute", top: 310, width: 90 }}
                            onClick={spin}
                            alt="Logo"
                        />
                    </>

                )}

                {result > -1 && (
                    <>
                        <Image src="/images/confetti.gif" alt="Confetti" height={620} style={{ position: "absolute", top: 0, left: 250 }} />
                        <Image src="/images/confetti.gif" alt="Confetti" height={620} style={{ position: "absolute", top: 0, right: 250 }} />
                        <Heading color="red.700" size="md" style={{ marginTop: -60 }}>CONGRATULATIONS! YOU WON</Heading>
                        <Center bg="red.700" color='white' width='60%' style={{ marginTop: -10 }}>
                            <Heading color="white" size="md">{data[result].label.toUpperCase()}</Heading>
                        </Center>
                        {data[result].type === 0 ? (
                            <Text style={{ textAlign: "center" }} px={8} fontSize={14}>
                                Your reward has been recorded or you can send the result directly to us. Share the joy with us on Instagram <Link href="https://instagram.com/peaksolutionsgroup?igshid=YmMyMTA2M2Y=" color="red.700">@peaksolutionsgroup</Link>!
                            </Text>
                        ) : (
                            <Text style={{ textAlign: "center" }} px={8} fontSize={14}>
                                Your reward has been recorded. The prize is waiting! Claim your prize at our office and share the joy with us on Instagram <Link href="https://instagram.com/peaksolutionsgroup?igshid=YmMyMTA2M2Y=" color="red.700">@peaksolutionsgroup</Link>!
                            </Text>
                        )}


                    </>
                )}

                {result > -1 && (
                    <Button colorPalette="red" variant="outline" mb={2} onClick={download}>Download Result</Button>
                )}

            </VStack>

        </div>
    );
}
