import { FieldType } from "@lark-base-open/js-sdk";

export const FIELDS: any = {
	[FieldType.Text]: {
		getCellValue: (record: any, field: any) => record.fields[getFieldId(field)]?.[0].text || "空值",
		allowX: true,
		allowY: true,
	},
	// [FieldType.SingleSelect]: {
	// 	allowX: true,
	// },
	[FieldType.DateTime]: {
		getCellValue: (record: any, field: any) => {
			let timeStamp = record.fields[getFieldId(field)];
			if (!timeStamp) {
				return "空值";
			}
			let date = new Date();
			let day = date.getDate();
			let month = date.getMonth() + 1; // 月份是从 0 开始的
			let year = date.getFullYear();
			return `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`;
		},
		allowX: true,
	},
	[FieldType.Number]: {
		getCellValue: (record: any, field: any) => record.fields[getFieldId(field)] || "空值",
		allowX: true,
		allowY: true,
	},
	[FieldType.User]: {
		getCellValue: (record: any, field: any) => record.fields[getFieldId(field)]?.map((user: any) => user?.name).join("、") || "空值",
		// getValue: (users: any[]) => {
		// 	users.map(user => user.name).join("、");
		// },
		allowX: true,
	},

	getAllowedFields(type: "X" | "Y") {
		let fields: number[] = [];
		Object.keys(this).forEach(field => {
			if (this[field][type === "X" ? "allowX" : "allowY"]) {
				fields.push(Number(field));
			}
		});
		return fields;
	},
};

// 用官方的 table.getCellValue 方法获取单列数据
export function getFieldValues(records: any, table: any, field: any): Promise<any[]> {
	return Promise.all(records.map((record: any) => table.getCellValue(field.context[1], record.recordId)));
}

export function getFieldId(field: any): string {
	return field.context[1];
}

export function getFieldValuesByRecords(records: any[], field: any): Promise<any[]> {
	return Promise.all(records.map(async record => FIELDS[await field.getType()].getCellValue(record, field)));
}
