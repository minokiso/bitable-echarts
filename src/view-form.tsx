import { memo, useEffect, useState } from "react";
import { FieldType, UIBuilder } from "@lark-base-open/js-sdk";
import { useTranslation, UseTranslationResponse } from "react-i18next";
import { FIELDS, getFieldValuesByRecords } from "./fields-meta";

export const ViewForm = memo(({ onSubmit, bitable }: { onSubmit: Function; bitable: any }) => {
	const translation = useTranslation();

	const allowedXAxisFields = FIELDS.getAllowedFields("X");
	const allowedDataFields = FIELDS.getAllowedFields("Y");

	const callback = async (uiBuilder: UIBuilder, { t }: UseTranslationResponse<"translation", undefined>) => {
		uiBuilder.form(
			form => ({
				formItems: [
					form.tableSelect("table", { label: "选择数据表" }),
					form.viewSelect("view", { label: "选择视图", sourceTable: "table" }),
					form.fieldSelect("xAxisField", { label: "X 轴字段", sourceTable: "table", multiple: false, filterByTypes: allowedXAxisFields }),
					form.fieldSelect("dataFields", { label: "数据字段（建议不要超过3个）", sourceTable: "table", multiple: true, filterByTypes: allowedDataFields }),
					form.select("chartType", {
						label: "图表类型",
						options: [
							{ label: "柱状图", value: "bar" },
							{ label: "折线图", value: "line" },
							{ label: "散点图", value: "scatter" },
						],
						defaultValue: "bar",
					}),
				],
				buttons: ["确定"],
			}),
			async ({ key, values }: any) => {
				if (!values.view) {
					uiBuilder.message.error("请选择视图");
					return;
				}
				if (!(values.xAxisField && values.dataFields)) {
					uiBuilder.message.error("请选择 X 轴字段和数据字段");
					return;
				}
				if (values.dataFields.length > 3) {
					uiBuilder.message.warning("您选择了超过3个数据字段，建议数据字段不要超过3个");
				}
				onSubmit([key, values]);
			}
		);
	};

	useEffect(() => {
		const container: HTMLElement = document.querySelector("#container") as HTMLElement;
		const uiBuilder = new UIBuilder(container, {
			bitable,
			callback,
			translation,
		});
		return () => {
			uiBuilder.unmount();
		};
	}, [translation]);

	return <div id="container"></div>;
});

export const viewFormSubmit = async (formData: any, setOption: Function) => {
	const [key, { table, view, xAxisField, dataFields, chartType }] = formData;
	let records = await Promise.all((await view.getVisibleRecordIdList()).map((recordId: string) => table.getRecordById(recordId)));
	// console.log("getRecords", records);
	// let xAxisName = await xAxisField.getName();
	let xAxisRecords = await getFieldValuesByRecords(records, xAxisField);
	// console.log(xAxisRecords);
	// console.log(dataFields);
	let yAxisRecords = await Promise.all(dataFields.map((dataField: any) => getFieldValuesByRecords(records, dataField)));
	let yAxisNames = await Promise.all(dataFields.map((dataField: any) => dataField.getName()));

	setOption({
		toolbox: {
			show: true,
			feature: {
				magicType: {
					type: ["line", "bar"],
				},
				restore: {},
				saveAsImage: { pixelRatio: 2, name: yAxisNames.join("-") },
			},
		},
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "shadow",
			},
		},
		legend: {},
		xAxis: {
			data: xAxisRecords,
			axisPointer: {
				show: true,
			},
		},
		yAxis: yAxisRecords.map((record, i) => {
			return { name: yAxisNames[i], axisLine: { show: true }, offset: Math.max(40 * (i - 1), 0), alignTicks: true };
		}),
		series: yAxisRecords.map((record, i) => {
			return { name: yAxisNames[i], type: chartType, data: record, yAxisIndex: i };
		}),
	});
};
