import { memo, useEffect, useState } from "react";
import { FieldType, UIBuilder } from "@lark-base-open/js-sdk";
import { useTranslation, UseTranslationResponse } from "react-i18next";
import { FIELDS, getFieldValuesByRecords, getViewRecords } from "../metas/fields-meta";
import { DatePicker, Select } from "antd";

const allowedXAxisFields = FIELDS.getAllowedFields("X");
const allowedDateAxisFields = [FieldType.DateTime];
const allowedHeatFields = FIELDS.getAllowedFields("Z");
const { RangePicker } = DatePicker;
export const HeatForm = memo(({ onSubmit, bitable }: { onSubmit: Function; bitable: any }) => {
	let [type, setType] = useState("normal");
	let [dateRange, setDateRange] = useState(["", ""]);
	const translation = useTranslation();
	const heatFormBuilder = async (uiBuilder: UIBuilder, { t }: UseTranslationResponse<"translation", undefined>) => {
		uiBuilder.form(
			form => ({
				formItems: [
					form.tableSelect("table", { label: "选择数据表" }),
					form.viewSelect("view", { label: "选择视图", sourceTable: "table" }),
					form.fieldSelect("xAxisField", { label: "X 轴字段", sourceTable: "table", multiple: false, filterByTypes: allowedXAxisFields }),
					form.fieldSelect("yAxisField", { label: "Y 轴字段", sourceTable: "table", multiple: false, filterByTypes: allowedXAxisFields }),
					form.fieldSelect("heatField", { label: "热度字段", sourceTable: "table", multiple: false, filterByTypes: allowedHeatFields }),
				],
				buttons: ["确定"],
			}),
			async ({ key, values }: any) => {
				if (!values.view) {
					uiBuilder.message.error("请选择视图");
					return;
				}
				if (!(values.xAxisField && values.yAxisField && values.heatField)) {
					uiBuilder.message.error(`请选择 X 轴字段、Y 轴字段和热度字段`);
					return;
				}
				onSubmit([key, values]);
			}
		);
	};

	const dateHeatFormBuilder = async (uiBuilder: UIBuilder, { t }: UseTranslationResponse<"translation", undefined>) => {
		uiBuilder.form(
			form => ({
				formItems: [
					form.tableSelect("table", { label: "选择数据表" }),
					form.fieldSelect("dateField", { label: "日期字段", sourceTable: "table", multiple: false, filterByTypes: allowedDateAxisFields }),
					form.fieldSelect("heatField", { label: "热度字段", sourceTable: "table", multiple: false, filterByTypes: allowedHeatFields }),
				],
				buttons: ["确定"],
			}),
			async ({ key, values }: any) => {
				if (!values.table) {
					uiBuilder.message.error("请选择数据表");
					return;
				}
				if (!(values.dateField && values.heatField)) {
					uiBuilder.message.error(`请选择日期字段、热度字段、日期范围`);
					return;
				}
				onSubmit([key, values, dateRange]);
			}
		);
	};

	useEffect(() => {
		const container: HTMLElement = document.querySelector("#container") as HTMLElement;
		const uiBuilder = new UIBuilder(container, {
			bitable,
			callback: type === "normal" ? heatFormBuilder : dateHeatFormBuilder,
			translation,
		});
		return () => {
			uiBuilder.unmount();
		};
	}, [translation, type]);

	return (
		<>
			<div style={{ margin: "1.5rem" }}>
				选择图表类型
				<Select
					defaultValue="normal"
					onChange={setType}
					options={[
						{ value: "normal", label: "热力图" },
						{ value: "date", label: "日历图" },
					]}
					style={{ width: "100%", marginTop: "1rem" }}
				/>
			</div>
			{type === "date" ? (
				<div style={{ margin: "1.5rem" }}>
					选择日期范围
					<RangePicker
						onChange={(_, dateString) => {
							setDateRange(dateString);
						}}
						picker="month"
						popupStyle={{ width: "400px" }}
						style={{ width: "100%", marginTop: "1rem" }}
					/>
				</div>
			) : (
				<></>
			)}
			<div id="container"></div>
		</>
	);
});

export const heatFormSubmit = async (formData: any, setOption: Function) => {
	const [key, { table, view, xAxisField, yAxisField, heatField, dateField }, dateRange] = formData;
	dateField ? await handleDate(table, dateField, heatField, dateRange, setOption) : await handleHeat(table, view, xAxisField, yAxisField, heatField, setOption);
};

async function handleDate(table: any, dateField: any, heatField: any, dateRange: any, setOption: any) {
	let records = (await table.getRecords({ pageSize: 5000 })).records;
	let [dateFieldMeta, heatFieldMeta] = [await dateField.getMeta(), heatField.getMeta()];
	let originHeat = FIELDS[heatFieldMeta.type].getCellValue(records[0], heatField);
	let maxHeat = originHeat;
	let minHeat = originHeat;
	let dataset: any = [];

	for (let record of records) {
		let heat = FIELDS[heatFieldMeta.type].getCellValue(record, heatField);
		if (heat) {
			maxHeat = Math.max(maxHeat, heat);
			minHeat = Math.min(minHeat, heat);
		}
		console.log(FIELDS[dateFieldMeta.type]);

		let date = FIELDS[dateFieldMeta.type].getCellValue(record, dateField);
		dataset.push([date, heat]);
	}
	console.log(dataset);
}

async function handleHeat(table: any, view: any, xAxisField: any, yAxisField: any, heatField: any, setOption: any) {
	let records = await getViewRecords(view, table);
	let [xAxisFieldMeta, yAxisFieldMeta, heatFieldMeta] = [await xAxisField.getMeta(), await yAxisField.getMeta(), await heatField.getMeta()];
	let xAxisMap: any = {};
	let yAxisMap: any = {};
	let dataset: any = [];
	let originHeat = FIELDS[heatFieldMeta.type].getCellValue(records[0], heatField);
	let maxHeat = originHeat;
	let minHeat = originHeat;
	for (let record of records) {
		let xCellValue = FIELDS[xAxisFieldMeta.type].getCellValue(record, xAxisField);
		let yCellValue = FIELDS[yAxisFieldMeta.type].getCellValue(record, yAxisField);
		let heat = FIELDS[heatFieldMeta.type].getCellValue(record, heatField);
		if (heat) {
			maxHeat = Math.max(maxHeat, heat);
			minHeat = Math.min(minHeat, heat);
		}
		if (!(xCellValue in xAxisMap)) {
			xAxisMap[xCellValue] = Object.keys(xAxisMap).length;
		}
		if (!(yCellValue in yAxisMap)) {
			yAxisMap[yCellValue] = Object.keys(yAxisMap).length;
		}
		dataset.push([xAxisMap[xCellValue], yAxisMap[yCellValue], heat || "-"]);
	}

	setOption({
		visualMap: {
			show: false,
			min: minHeat,
			max: maxHeat,
		},
		tooltip: {},

		toolbox: {
			show: true,
			feature: {
				saveAsImage: { pixelRatio: 2 },
			},
		},
		xAxis: {
			type: "category",
			data: Object.keys(xAxisMap),
			name: xAxisFieldMeta.name,
			splitArea: {
				show: true,
			},
		},
		yAxis: {
			type: "category",
			data: Object.keys(yAxisMap),
			name: yAxisFieldMeta.name,
			splitArea: {
				show: true,
			},
		},
		series: {
			name: heatFieldMeta.name,
			type: "heatmap",
			data: dataset,
			label: {
				show: true,
			},
			emphasis: {
				itemStyle: {
					shadowBlur: 10,
					shadowColor: "rgba(0, 0, 0, 0.5)",
				},
			},
		},
	});
}
