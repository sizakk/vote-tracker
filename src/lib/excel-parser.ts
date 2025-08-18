import * as XLSX from 'xlsx';
import { Employee, ExcelParseError } from './types';

/**
 * Excel 파일을 파싱하여 Employee 배열로 변환하는 함수
 * @param file - 업로드된 Excel 파일
 * @returns Promise<Employee[]> - 파싱된 직원 데이터 배열
 */
export async function parseExcelFile(file: File): Promise<Employee[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                // 첫 번째 시트 사용
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // JSON으로 변환
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

                // 헤더 제거 (첫 번째 행)
                const dataRows = jsonData.slice(1);

                // Employee 객체로 변환
                const employees: Employee[] = dataRows.map((row, index) => {
                    const rowData = row as unknown[];

                    return {
                        no: Number(rowData[0]) || 0,
                        employeeId: String(rowData[1] || ''),
                        category: String(rowData[2] || ''),
                        majorOrg: String(rowData[3] || ''),
                        organization: String(rowData[4] || ''),
                        name: String(rowData[5] || ''),
                        grade: String(rowData[6] || ''),
                        gradeYear: Number(rowData[7]) || 0,
                        position: String(rowData[8] || ''),
                        yearsOfService: Number(rowData[9]) || 0,
                        hiringType: String(rowData[10] || ''),
                        gender: String(rowData[11] || ''),
                        age: Number(rowData[12]) || 0,
                        isImplemented: String(rowData[13] || ''),
                        implementationDate: String(rowData[14] || ''),
                        agreementStatus: String(rowData[15] || ''),
                        confirmationStatus: String(rowData[16] || ''),
                        confirmationDate: String(rowData[17] || ''),
                        agreementType: String(rowData[18] || '')
                    };
                });

                // 데이터 유효성 검사
                const isValid = validateEmployeeData(employees);
                if (!isValid) {
                    throw new ExcelParseError('데이터 유효성 검사에 실패했습니다.');
                }

                resolve(employees);
            } catch (err) {
                reject(new ExcelParseError(`파일 파싱 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`));
            }
        };

        reader.onerror = () => {
            reject(new ExcelParseError('파일을 읽을 수 없습니다.'));
        };

        reader.readAsArrayBuffer(file);
    });
}

/**
 * 파싱된 직원 데이터의 유효성을 검사하는 함수
 * @param employees - 검사할 직원 데이터 배열
 * @returns boolean - 유효성 검사 결과
 */
export function validateEmployeeData(employees: Employee[]): boolean {
    if (!employees || employees.length === 0) {
        return false;
    }

    for (const employee of employees) {
        // 필수 필드 검사
        if (!employee.employeeId || !employee.name) {
            return false;
        }

        // 숫자 필드 검사
        if (isNaN(employee.gradeYear) || isNaN(employee.age) || isNaN(employee.yearsOfService)) {
            return false;
        }

        // 동의여부, 실시여부 검사 (Y/N)
        if (!['Y', 'N'].includes(employee.agreementStatus) || !['Y', 'N'].includes(employee.isImplemented)) {
            return false;
        }
    }

    return true;
}

/**
 * Excel 파일의 기본 정보를 가져오는 함수
 * @param file - Excel 파일
 * @returns Promise<{sheetNames: string[], rowCount: number}>
 */
export async function getExcelFileInfo(file: File): Promise<{ sheetNames: string[], rowCount: number }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                const sheetNames = workbook.SheetNames;
                const firstSheet = workbook.Sheets[sheetNames[0]];
                const rowCount = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }).length;

                resolve({ sheetNames, rowCount });
            } catch (error) {
                reject(new ExcelParseError('Excel 파일 정보를 읽을 수 없습니다.'));
            }
        };

        reader.onerror = () => {
            reject(new ExcelParseError('파일 읽기 오류가 발생했습니다.'));
        };

        reader.readAsArrayBuffer(file);
    });
}
