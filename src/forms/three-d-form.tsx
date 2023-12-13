import { memo, useEffect, useState } from "react";
import { FieldType, UIBuilder } from "@lark-base-open/js-sdk";
import { useTranslation, UseTranslationResponse } from "react-i18next";
import { FIELDS, getFieldId, getFieldValuesByRecords, getViewRecords, getViewRecordsCellString } from "../metas/fields-meta";
import "echarts-gl";
// issue: https://github.com/apache/echarts/issues/18476

export const ThreeDForm = memo(({ onSubmit, bitable }: { onSubmit: Function; bitable: any }) => {
	const translation = useTranslation();
	const allowedXAxisFields = FIELDS.getAllowedFields("X");
	const allowedYAxisFields = FIELDS.getAllowedFields("Y");
	const allowedZAxisFields = FIELDS.getAllowedFields("Z");

	const callback = async (uiBuilder: UIBuilder, { t }: UseTranslationResponse<"translation", undefined>) => {
		uiBuilder.form(
			form => ({
				formItems: [
					form.tableSelect("table", { label: "选择数据表" }),
					form.viewSelect("view", { label: "选择视图", sourceTable: "table" }),
					form.fieldSelect("xAxisField", { label: "X 轴字段", sourceTable: "table", multiple: false, filterByTypes: allowedXAxisFields }),
					form.fieldSelect("yAxisField", { label: "Y 轴字段", sourceTable: "table", multiple: false, filterByTypes: allowedYAxisFields }),
					form.fieldSelect("zAxisField", { label: "Z 轴字段", sourceTable: "table", multiple: false, filterByTypes: allowedZAxisFields }),
					form.select("chartType", {
						label: "图表类型",
						options: [
							{ label: "3D 柱状图", value: "bar3D" },
							{ label: "3D 散点图", value: "scatter3D" },
						],
						defaultValue: "bar3D",
					}),
				],
				buttons: ["确定"],
			}),
			async ({ key, values }: any) => {
				if (!values.view) {
					uiBuilder.message.error("请选择视图");
					return;
				}
				if (!(values.xAxisField && values.yAxisField && values.zAxisField)) {
					uiBuilder.message.error("请完整选择 X Y Z 轴字段");
					return;
				}
				if (!(values.xAxisField != values.yAxisField && values.xAxisField != values.zAxisField && values.yAxisField != values.zAxisField)) {
					uiBuilder.message.error("X Y Z 轴不可以出现重复哦");
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
			callback,
			translation,
		});
		return () => {
			uiBuilder.unmount();
		};
	}, [translation]);

	return <div id="container"></div>;
});

export const threeDFormSubmit = async (formData: any, setOption: Function) => {
	const [key, { table, view, xAxisField, yAxisField, zAxisField, chartType }] = formData;
	// let records = (await table.getRecords({ pageSize: 5000 })).records;
	let records = await getViewRecords(view, table);
	// console.log(records);

	let fieldMetaList = await view.getFieldMetaList();
	let [xAxisFieldMeta, yAxisFieldMeta, zAxisFieldMeta] = [await xAxisField.getMeta(), await yAxisField.getMeta(), await zAxisField.getMeta()];

	let recordsValue: any[] = [];
	let originZValue = FIELDS[zAxisFieldMeta.type].getCellValue(records[0], zAxisFieldMeta.id);
	let maxZValue: number = originZValue;
	let minZValue: number = originZValue;

	records.forEach((record: any) => {
		let _record: any = [];
		fieldMetaList.forEach((fieldMeta: any) => {
			if (fieldMeta.type in FIELDS) {
				let cellValue = FIELDS[fieldMeta.type].getCellValue(record, fieldMeta.id);
				if (fieldMeta.id === zAxisFieldMeta.id && cellValue) {
					maxZValue = Math.max(maxZValue, cellValue);
					minZValue = Math.min(minZValue, cellValue);
				}
				_record.push(cellValue || "-");
			} else {
				_record.push("-");
			}
		});
		recordsValue.push(_record);
	});

	setOption({
		grid3D: {},
		tooltip: {},
		toolbox: {
			show: true,
			feature: {
				saveAsImage: { pixelRatio: 2 },
			},
		},
		xAxis3D: {
			type: FIELDS[xAxisFieldMeta.type].axisType,
			// type: "category",
			min: "dataMin",
			max: "dataMax",

			name: xAxisFieldMeta.name,
		},
		yAxis3D: {
			// type: "category",
			min: "dataMin",
			max: "dataMax",
			type: FIELDS[yAxisFieldMeta.type].axisType,
			name: yAxisFieldMeta.name,
		},
		zAxis3D: {
			name: zAxisFieldMeta.name,
		},
		visualMap: {
			max: maxZValue,
			min: minZValue,
			dimension: zAxisFieldMeta.name,
		},
		dataset: [
			{
				source: recordsValue,
				dimensions: fieldMetaList.map((fieldMeta: any) => fieldMeta.name),
			},
		],
		series: [
			{
				type: chartType,
				name: zAxisFieldMeta.name,
				shading: "lambert",
				encode: {
					x: xAxisFieldMeta.name,
					y: yAxisFieldMeta.name,
					z: zAxisFieldMeta.name,
				},
			},
		],
	});
};
