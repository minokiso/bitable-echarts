import { memo, useEffect } from "react";
import { Button, Card, Dropdown, MenuProps, Space, Tooltip, message } from "antd";
import { DownloadOutlined, ReloadOutlined, SkinOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { _echarts, themes } from "./metas/theme-meta";
import { getActiveTable, getSelection } from "./App";
import { FieldType } from "@lark-base-open/js-sdk";
export type EChartsOption = echarts.EChartsOption;

let theme: string;
// const imageMenuItems = [
// 	{
// 		key: "download",
// 		label: "下载图片",
// 	},
// 	{
// 		key: "insert",
// 		label: "插入至单元格",
// 	},
// ]

export default function EChartsComponent({ option }: { option: EChartsOption }) {
	let chartDom: HTMLElement;
	let chart: echarts.ECharts;
	const renderChart = () => {
		if (!chart) {
			chart = _echarts.init(chartDom, theme);
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
			chart && chart.dispose();
		};
	});

	let reload = (theme: string = "default") => {
		if (chart) {
			chart.dispose();
			chart = _echarts.init(chartDom, theme);
			chart.setOption(option);
		}
	};

	const onThemeChange: MenuProps["onClick"] = ({ key }) => {
		theme = key;
		reload(theme);
	};

	// 生成图表文件
	function generateImg() {
		return new Promise<File>((resolve, reject) => {
			var img = new Image();
			img.src = chart.getDataURL({
				type: "png",
				pixelRatio: 2, //放大2倍
				backgroundColor: "#fff",
			});
			img.onload = () => {
				let canvas = document.createElement("canvas");
				let ctx: any = canvas.getContext("2d");
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0);
				canvas.toBlob(blob => {
					let file = new File([blob as Blob], "downloaded-image.png", { type: "image/png" });
					resolve(file);
				}, "image/png");
			};
		});
	}

	async function insertInto() {
		message.loading("正在插入", 0);
		let selection = await getSelection();
		if (!(selection.fieldId && selection.recordId)) {
			message.destroy();
			message.info("请选择一个空的附件单元格");
			return;
		}
		let table = await getActiveTable();
		let fieldMeta = await table.getFieldMetaById(selection.fieldId);
		if (fieldMeta.type !== FieldType.Attachment) {
			message.destroy();
			message.info("请选择一个空的附件单元格");
			return;
		}
		let field = await table.getField(fieldMeta.id);
		generateImg()
			.then(async (file: File) => {
				await field.setValue(selection.recordId as string, file);
				message.destroy();
				message.success("插入成功");
			})
			.catch(err => console.log(err));
	}

	return (
		<Card
			// title="Default size card"
			extra={
				<Space size={"middle"}>
					<Dropdown menu={{ items: themes, onClick: onThemeChange, selectable: true, defaultSelectedKeys: ["default"] }} trigger={["click"]}>
						<Button type="text" size={"small"} icon={<SkinOutlined />} onClick={e => e.preventDefault()}></Button>
					</Dropdown>
					<Button type="text" size={"small"} title="重新加载" icon={<ReloadOutlined />} onClick={() => reload(theme)}></Button>
					<Tooltip title="请选择一个空的附件单元格，将图片插入其中，">
						{/* <Dropdown menu={{ items: themes}}> */}
						<Button type="text" size={"small"} icon={<VerticalAlignBottomOutlined />} onClick={insertInto}></Button>
						{/* </Dropdown> */}
					</Tooltip>
				</Space>
			}
			style={{ width: "90%", margin: "5%" }}
		>
			<div id="chart" style={{ height: "400px" }}></div>
		</Card>
	);
}
