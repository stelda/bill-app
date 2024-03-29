/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList).toContain('active-icon');
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  // test for new bill button
  describe("When I click on New Bill button", () => {
    test("Then it should navigate and display the new bill form", () => {
      // check if the user is connected as an employee
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      // ********* check if the new bill button exists
      const newBillButton = screen.getByTestId('btn-new-bill')
      // click on the new bill button
      userEvent.click(newBillButton)
      // ********* check if the new bill button have been clicked
      expect(newBillButton).toHaveBeenClicked()
      // check if the window location is new bill page
      expect(window.location.href).toBe('http://localhost/#employee/bill/new')
      // check if the new bill form is displayed
      const newBillForm = screen.getByTestId('form-new-bill')
      expect(newBillForm).toBeTruthy()
    })
  })
  // test for eye icon
  describe("When I click on the eye icon", () => {
    test("Then a modal opens", () => {
      // check if the user is connected as an employee
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      // check if the eye icon exists
      const eyeIcon = screen.getAllByTestId('icon-eye')[0]
      // check if the eye icon is clicked
      userEvent.click(eyeIcon)
      // ********* check if the icon have been clicked
      expect(eyeIcon).toHaveBeenClicked()
      // ********* check if the function handleClickIconEye have been called
      expect(handleClickIconEye).toHaveBeenCalled()
      // check if the modal is opened
      const modal = screen.getByTestId('modaleFile')
      expect(modal.style.display).toBe('block')
      // check if the modal contains title
      expect(modal.querySelector('.content-title').textContent).toBe('Envoyer une note de frais')
      // check if the modal contains a form
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
    })
  })
})

