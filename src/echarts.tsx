import { memo, useEffect } from "react";
import * as echarts from "echarts";
import { Card, Space } from "antd";
import { DownloadOutlined, RedoOutlined, ReloadOutlined } from "@ant-design/icons";
export type EChartsOption = echarts.EChartsOption;
export default memo(function EChartsComponent({ option }: { option: EChartsOption }) {
	let chartDom: HTMLElement;
	let chart: echarts.ECharts;

	const renderChart = () => {
		if (!chart) {
			chart = echarts.init(chartDom);
		}
		chart.setOption(option);
	};

	useEffect(() => {
		chartDom = document.querySelector("#chart") as HTMLElement;
		renderChart();
		return () => {
			chart && chart.dispose();
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

	let reload = () => {
		chart && chart.dispose();
		chart = chartDom && echarts.init(chartDom);
		chart.setOption(option);
	};

	// 导出单个图表图片
	function exportImg() {
		var img = new Image();
		img.src = chart.getDataURL({
			type: "png",
			pixelRatio: 2, //放大2倍
			backgroundColor: "#fff",
		});
		img.onload = function () {
			let canvas = document.createElement("canvas");
			let ctx: any = canvas.getContext("2d");
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);
			downloadImage(canvas);
		};

		function downloadImage(canvas: HTMLCanvasElement) {
			let link = document.createElement("a");
			link.download = "downloaded-image.png"; // 下载的文件名
			link.href = canvas.toDataURL("image/png"); // 创建数据URL
			link.click(); // 触发下载
		}
	}
	return (
		// <Card
		// 	// title="Default size card"
		// 	extra={
		// 		<Space size={"middle"}>
		// 			<ReloadOutlined onClick={reload} title="重新加载" />
		// 			<DownloadOutlined onClick={exportImg} title="导出图片" />
		// 		</Space>
		// 	}
		// 	style={{ width: "90%", margin: "5%" }}
		// >
		<div id="chart" style={{ height: "400px" }}></div>
		// </Card>
	);
});
