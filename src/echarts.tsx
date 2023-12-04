import { memo, useEffect } from "react";
import * as echarts from "echarts";
import { Card, Dropdown, MenuProps, Space } from "antd";
import { ReloadOutlined, SkinOutlined } from "@ant-design/icons";
export type EChartsOption = echarts.EChartsOption;

const themes = [
	{
		key: "chalk",
		label: "Chalk",
	},
	{
		key: "essos",
		label: "Essos",
	},
	{
		key: "westeros",
		label: "Westeros",
	},
	{
		key: "infographic",
		label: "Infographic",
	},
	{
		key: "macarons",
		label: "Macarons",
	},
	{
		key: "purple-passion",
		label: "Purple Passion",
	},
	{
		key: "roma",
		label: "Roma",
	},
	{
		key: "shine",
		label: "Shine",
	},
	{
		key: "vintage",
		label: "Vintage",
	},
	{
		key: "walden",
		label: "Walden",
	},
	{
		key: "wonderland",
		label: "Wonderland",
	},
];

themes.forEach((theme: any) => {
	if (!theme.registered) {
		delete theme.registered;
		fetch(`theme/${theme.key}.json`)
			.then(r => r.json())
			.then(themeJson => {
				echarts.registerTheme(theme.key, themeJson);
			});
	}
});

themes.unshift(
	{
		key: "default",
		label: "默认",
	},
	{
		key: "dark",
		label: "暗黑",
	}
);

let theme: string;

export default memo(function EChartsComponent({ option }: { option: EChartsOption }) {
	let chartDom: HTMLElement;
	let chart: echarts.ECharts;
	const renderChart = () => {
		if (!chart) {
			chart = echarts.init(chartDom, theme);
		}
		chart.setOption(option);
	};

	useEffect(() => {
		chartDom = document.querySelector("#chart") as HTMLElement;
		renderChart();
		return () => {
			chart.dispose();
		};
	}, [option]);

	useEffect(() => {
		const handleResize = () => {
			chart && chart.resize();
		};
		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	});

	let reload = (theme: string = "default") => {
		if (chart) {
			chart.dispose();
			chart = echarts.init(chartDom, theme);
			chart.setOption(option);
		}
	};

	const onThemeChange: MenuProps["onClick"] = async ({ key }) => {
		theme = key;
		reload(theme);
	};
	// 导出单个图表图片
	// function exportImg() {
	// 	var img = new Image();
	// 	img.src = chart.getDataURL({
	// 		type: "png",
	// 		pixelRatio: 2, //放大2倍
	// 		backgroundColor: "#fff",
	// 	});
	// 	img.onload = function () {
	// 		let canvas = document.createElement("canvas");
	// 		let ctx: any = canvas.getContext("2d");
	// 		canvas.width = img.width;
	// 		canvas.height = img.height;
	// 		ctx.drawImage(img, 0, 0);
	// 		downloadImage(canvas);
	// 	};

	// 	function downloadImage(canvas: HTMLCanvasElement) {
	// 		let link = document.createElement("a");
	// 		link.download = "downloaded-image.png"; // 下载的文件名
	// 		link.href = canvas.toDataURL("image/png"); // 创建数据URL
	// 		link.click(); // 触发下载
	// 	}
	// }
	return (
		<Card
			// title="Default size card"
			extra={
				<Space size={"middle"}>
					<Dropdown menu={{ items: themes, onClick: onThemeChange, selectable: true, defaultSelectedKeys: ["default"] }} trigger={["click"]}>
						<SkinOutlined onClick={e => e.preventDefault()} />
					</Dropdown>
					<ReloadOutlined onClick={() => reload(theme)} title="重新加载" />
					{/* <DownloadOutlined onClick={exportImg} title="导出图片" /> */}
				</Space>
			}
			style={{ width: "90%", margin: "5%" }}
		>
			<div id="chart" style={{ height: "400px" }}></div>
		</Card>
	);
});
