/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import {ROUTES_PATH} from "../constants/routes.js";
import mail from "../assets/svg/mail.js";

import mockStore from "../__mocks__/store.js";
import {fireEvent, screen, waitFor} from "@testing-library/dom"

describe("Given I am connected as an employee", () => {

  describe("When I am on NewBill Page", () => {
		test("Then mail icon in vertical layout should be highlighted", async () => {
			// Set up authentification
			Object.defineProperty(window, 'localStorage', {value: localStorageMock})
			window.localStorage.setItem('user', JSON.stringify({
					type: 'Employee'
			}))
			// Set up the document body
			const root = document.createElement("div")
			root.setAttribute("id", "root")
			document.body.append(root)
			router()
			window.onNavigate(ROUTES_PATH.NewBill)
			// Check if the bill icon is highlighted
			await waitFor(() => screen.getByTestId('icon-mail'))
			const mailIcon = screen.getByTestId('icon-mail')
			// to-do write expect expression
			expect(mailIcon.classList).toContain('active-icon');
		})
  })

  describe("When I upload a document", () => {
		test("Then handleChangeFile should be triggered", async () => {
			// Set up the document body
			document.body.innerHTML = NewBillUI()
			// Instantiate a new NewBill object
			const newBill = new NewBill({
				document,
				onNavigate,
				store: mockStore,
				localStorage: window.localStorage
			})
			// check if handleChangeFile function (containers\NewBill line23) is called
			const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))

			// get the file input
			await waitFor(() => screen.getByTestId('file'))
			const inputFile = screen.getByTestId('file')

			// attach an event listener to inputFile
			inputFile.addEventListener('change', handleChangeFile)

			// simulate a change event where a file is uploaded
			fireEvent.change(inputFile, {
				target: {
				files: [new File(['test'], 'test.png', {type: 'image/png'})]
				}
			})
			// check if the handleChangeFile function has been called
			expect(handleChangeFile).toHaveBeenCalled()
			// check if the handleChangeFile function has been called once
			expect(handleChangeFile).toHaveBeenCalledTimes(1)
			// check if the handleChangeFile function has been called with the right argument
			expect(handleChangeFile).toHaveBeenCalledWith(expect.objectContaining({
				target: expect.objectContaining({
				files: [expect.any(File)]
			})
			}))
		})
	})

  describe("When I upload a file with a wrong extension", () => {
		test("Then the file should not be uploaded", async () => {
			// Set up the document body
			document.body.innerHTML = NewBillUI()
			// Instantiate a new NewBill object
			const newBill = new NewBill({
				document,
				onNavigate,
				store: mockStore,
				localStorage: window.localStorage
			})
			// check if handleChangeFile function (containers\NewBill line23) is called
			const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))

			// get the file input
			await waitFor(() => screen.getByTestId('file'))
			const inputFile = screen.getByTestId('file')

			// attach an event listener to inputFile
			inputFile.addEventListener('change', handleChangeFile)

			// simulate a change event where a file with an invalid extension is uploaded
			fireEvent.change(inputFile, {
				target: {
				files: [new File(['test'], 'test.pdf', {type: 'doc/pdf'})]
				}
			})
			// check if the handleChangeFile function has been called
			expect(handleChangeFile).toHaveBeenCalled()
			// check if the handleChangeFile function has been called once
			expect(handleChangeFile).toHaveBeenCalledTimes(1)
			// check if the handleChangeFile function has been called with the right argument
			expect(screen.getByTestId('file').value).toBe('');
		})
  })

	// integration test POST
	describe("When I submit a new bill", () => {
		test("Then the new bill should be added to the bills list", async () => {
			// Set up the document body
			document.body.innerHTML = NewBillUI()
			// Instantiate a new NewBill object
			const newBill = new NewBill({
				document,
				onNavigate,
				store: mockStore,
				localStorage: window.localStorage
			})

			// simulate the filling of the form using fireEvent
			fireEvent.change(screen.getByTestId('expense-type'), {target: {value: 'Transports'}})
			fireEvent.change(screen.getByTestId('expense-name'), {target: {value: 'Vol Paris-Brest'}})
			fireEvent.change(screen.getByTestId('datepicker'), {target: {value: '2023-08-15'}})
			fireEvent.change(screen.getByTestId('amount'), {target: {value: '100'}})
			fireEvent.change(screen.getByTestId('vat'), {target: {value: '20'}})
			fireEvent.change(screen.getByTestId('pct'), {target: {value: '20'}})
			fireEvent.change(screen.getByTestId('commentary'), {target: {value: 'bill test added by filing form with fireEvent'}})
			fireEvent.change(screen.getByTestId('file'), {target: {files: [new File(['test'], 'test.jpg', {type: 'image/jpg'})]}})

			// get the form
			await waitFor(() => screen.getByTestId('form-new-bill')) // wait that the form is rendered in the DOM
			const form = screen.getByTestId('form-new-bill')

			// mock handleSubmit function (containers\NewBill line47) with jest
			const mockedHandleSubmit = jest.fn((e) => newBill.handleSubmit(e))
			// add an event listener to the form
			form.addEventListener('submit', mockedHandleSubmit)

			// simulate a submit event with fireEvent
			fireEvent.submit(form)
			// check if the handleSubmit function has been called
			expect(mockedHandleSubmit).toHaveBeenCalled()
			// check if the handleSubmit function has been called once
			expect(mockedHandleSubmit).toHaveBeenCalledTimes(1);
		})
	})

	// integration test POST error
	describe("When an error occurs on API", () => {
		beforeEach(() => {
			// initialize mockSTore
			jest.spyOn(mockStore, "bills").mockReturnValue({
				list: () => Promise.resolve([])
			});

			Object.defineProperty(
				window,
				'localStorage',
				{value: localStorageMock}
			)
			window.localStorage.setItem('user', JSON.stringify({
				type: 'Employee',
				email: "e@e"
			}))
			const root = document.createElement("div")
			root.setAttribute("id", "root")
			document.body.appendChild(root)
			router()
		})
		test("then fetches bills from an API and fails with 404 message error", async () => {
			mockStore.bills.mockImplementationOnce(() => {
				return {
					list: () => {
						return Promise.reject(new Error("Erreur 404"))
					}
				}
			})
			window.onNavigate(ROUTES_PATH.Bills)
			await new Promise(process.nextTick);
			const message = await screen.getByText(/Erreur/)
			expect(message).toBeTruthy()
		})
		test("then fetches messages from an API and fails with 500 message error", async () => {
			mockStore.bills.mockImplementationOnce(() => {
				return {
					list: () => {
						return Promise.reject(new Error("Erreur 500"))
					}
				}
			})
			window.onNavigate(ROUTES_PATH.Bills)
			await new Promise(process.nextTick);
			const message = await screen.getByText(/Erreur/)
			expect(message).toBeTruthy()
		})
		afterEach(() => {
			jest.resetAllMocks()
		})
	})
})


