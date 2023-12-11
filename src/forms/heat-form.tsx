import { memo, useEffect, useState } from "react";
import { FieldType, UIBuilder } from "@lark-base-open/js-sdk";
import { useTranslation, UseTranslationResponse } from "react-i18next";
import { FIELDS, getFieldValuesByRecords, getViewRecords } from "../metas/fields-meta";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";

const allowedXAxisFields = FIELDS.getAllowedFields("X");
const allowedDateAxisFields = [FieldType.DateTime];
const allowedHeatFields = FIELDS.getAllowedFields("Z");
// const { RangePicker } = DatePicker;
// let dateRange: any;
// let dateStringRange: any;
export const HeatForm = memo(({ onSubmit, bitable }: { onSubmit: Function; bitable: any }) => {
	let [type, setType] = useState("normal");
	// let [dateRange, setDateRange] = useState<string[] | null[]>([null, null]);
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
					uiBuilder.message.error(`请选择日期字段、热度字段`);
					return;
				}
				onSubmit([key, values]);
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
			<div id="container"></div>
		</>
	);
});

export const heatFormSubmit = async (formData: any, setOption: Function) => {
	const [key, { table, view, xAxisField, yAxisField, heatField, dateField }] = formData;
	dateField ? await handleDate(table, dateField, heatField, setOption) : await handleHeat(table, view, xAxisField, yAxisField, heatField, setOption);
};

async function handleDate(table: any, dateField: any, heatField: any, setOption: any) {
	let records = (await table.getRecords({ pageSize: 5000 })).records;
	let [dateFieldMeta, heatFieldMeta] = [await dateField.getMeta(), await heatField.getMeta()];

	let originHeat = FIELDS[heatFieldMeta.type].getCellValue(records[0], heatField);
	let originDate = FIELDS[dateFieldMeta.type].getCellValue(records[0], dateField)?.slice(0, 4);

	let maxHeat = originHeat;
	let minHeat = originHeat;
	let maxDate = originDate;
	let minDate = originDate;
	let dataset: any = {};

	for (let record of records) {
		let heat = FIELDS[heatFieldMeta.type].getCellValue(record, heatField);
		if (heat) {
			maxHeat = Math.max(maxHeat, heat);
			minHeat = Math.min(minHeat, heat);
		}
		let date = FIELDS[dateFieldMeta.type].getCellValue(record, dateField);

		if (date) {
			let year = Number(date.slice(0, 4));
			maxDate = maxDate ? Math.max(Number(maxDate), year) : year;
			minDate = minDate ? Math.min(Number(minDate), year) : year;
			if (!(year in dataset)) {
				dataset[year] = [[date, heat]];
			} else {
				dataset[year].push([date, heat]);
			}
		}
	}
	let years = Object.keys(dataset);
	setOption({
		tooltip: {
			position: "top",
		},
		visualMap: {
			min: minHeat,
			max: maxHeat,
			calculable: true,
			orient: "horizontal",
			left: "center",
			bottom: "bottom",
			align: "top",
			itemWidth: 8,
		},
		toolbox: {
			show: true,
			feature: {
				saveAsImage: { pixelRatio: 2 },
			},
			left: 5,
		},
		calendar: years.map((year, i) => {
			return {
				top: 20 + (370 / years.length) * i,
				right: 5,
				range: year,
				cellSize: ["auto", 40 / years.length],
			};
		}),
		series: years.map((year, i) => {
			return {
				type: "heatmap",
				coordinateSystem: "calendar",
				calendarIndex: i,
				data: dataset[year],
				name: heatFieldMeta.name,
			};
		}),
	});
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
			maxHeat = maxHeat ? Math.max(maxHeat, heat) : heat;
			minHeat = minHeat ? Math.min(minHeat, heat) : heat;
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
